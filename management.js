// SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
// SPDX-License-Identifier: MPL-2.0

"use strict";

const accountId = new URL(location.href).searchParams.get("accountId");
const form = document.querySelector("#settings-form");
const serverUrlInput = document.querySelector("#server-url");
const apiKeyInput = document.querySelector("#api-key");
const expiryDaysInput = document.querySelector("#expiry-days");
const allowedDownloadsInput = document.querySelector("#allowed-downloads");
const protectInput = document.querySelector("#protect-with-password");
const passwordInput = document.querySelector("#download-password");
const passwordField = document.querySelector(".password-field");
const toggleApiKeyButton = document.querySelector("#toggle-api-key");
const togglePasswordButton = document.querySelector("#toggle-password");
const saveButton = document.querySelector("#save-button");
const status = document.querySelector("#status");
const statusText = document.querySelector("#status-text");

function setStatus(state, message = "") {
  status.dataset.state = state;
  statusText.textContent = message;
}

function setBusy(busy) {
  saveButton.disabled = busy;
  saveButton.setAttribute("aria-busy", String(busy));
}

function normalizeUrl(value) {
  const rawValue = value.trim();
  if (!rawValue) {
    throw new Error("L’URL de l’instance est obligatoire.");
  }

  let url;
  try {
    url = new URL(rawValue);
  } catch {
    throw new Error("L’URL de l’instance n’est pas valide.");
  }
  if (url.protocol !== "https:") {
    throw new Error("L’instance Gokapi doit être accessible en HTTPS.");
  }
  if (url.username || url.password) {
    throw new Error("L’URL ne doit pas contenir d’identifiants.");
  }

  url.search = "";
  url.hash = "";
  return url.href.replace(/\/+$/, "");
}

function integerValue(input, label, max) {
  const value = Number(input.value);
  if (!Number.isInteger(value) || value < 0 || value > max) {
    throw new Error(`${label} doit être compris entre 0 et ${max}.`);
  }
  return value;
}

function readFormConfig() {
  const config = {
    serverUrl: normalizeUrl(serverUrlInput.value),
    apiKey: apiKeyInput.value.trim(),
    expiryDays: integerValue(expiryDaysInput, "L’expiration", 3650),
    allowedDownloads: integerValue(
      allowedDownloadsInput,
      "Le nombre de téléchargements",
      1000000
    ),
    protectWithPassword: protectInput.checked,
    password: passwordInput.value
  };

  if (!config.apiKey) {
    throw new Error("La clé API est obligatoire.");
  }
  if (config.protectWithPassword && !config.password) {
    throw new Error("Saisissez le mot de passe à utiliser pour les téléchargements.");
  }
  return config;
}

function updatePasswordState() {
  const enabled = protectInput.checked;
  passwordInput.disabled = !enabled;
  togglePasswordButton.disabled = !enabled;
  passwordField.dataset.enabled = String(enabled);
}

function installRevealButton(button, input, visibleLabel, hiddenLabel) {
  button.addEventListener("click", () => {
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.setAttribute("aria-pressed", String(reveal));
    button.setAttribute("aria-label", reveal ? hiddenLabel : visibleLabel);
    input.focus();
  });
}

async function loadConfiguration() {
  if (!accountId) {
    setStatus("error", "Identifiant de compte FileLink manquant.");
    saveButton.disabled = true;
    return;
  }

  const { accounts = {} } = await browser.storage.local.get("accounts");
  const config = accounts[accountId];
  if (!config) {
    updatePasswordState();
    return;
  }

  serverUrlInput.value = config.serverUrl || "";
  apiKeyInput.value = config.apiKey || "";
  expiryDaysInput.value = String(config.expiryDays ?? 14);
  allowedDownloadsInput.value = String(config.allowedDownloads ?? 0);
  protectInput.checked = Boolean(config.protectWithPassword);
  passwordInput.value = config.password || "";
  updatePasswordState();
}

async function saveConfiguration(event) {
  event.preventDefault();
  setBusy(true);
  setStatus("checking", "Test de la connexion à Gokapi…");

  try {
    const config = readFormConfig();
    const result = await browser.runtime.sendMessage({
      type: "gokapi:testConnection",
      config
    });

    if (!result?.ok) {
      throw new Error("La connexion à Gokapi a échoué.");
    }
    if (result.endToEndEncryptionEnabled) {
      throw new Error(
        "Cette instance active le chiffrement E2E, non pris en charge par l’API d’upload Gokapi."
      );
    }

    const { accounts = {} } = await browser.storage.local.get("accounts");
    accounts[accountId] = {
      ...config,
      serverVersion: result.version,
      maxFileSizeBytes: result.maxFileSizeBytes,
      updatedAt: Date.now()
    };
    await browser.storage.local.set({ accounts });

    await browser.cloudFile.updateAccount(accountId, {
      configured: true,
      spaceRemaining: -1,
      spaceUsed: -1,
      uploadSizeLimit:
        Number(result.maxFileSizeBytes) > 0
          ? result.maxFileSizeBytes
          : -1
    });

    setStatus("success", `Connexion réussie — Gokapi ${result.version}`);
  } catch (error) {
    console.error("FileLink for Gokapi configuration failed", error);
    setStatus(
      "error",
      error?.message || "La configuration n’a pas pu être enregistrée."
    );
  } finally {
    setBusy(false);
  }
}

protectInput.addEventListener("change", updatePasswordState);
form.addEventListener("submit", saveConfiguration);
installRevealButton(
  toggleApiKeyButton,
  apiKeyInput,
  "Afficher la clé API",
  "Masquer la clé API"
);
installRevealButton(
  togglePasswordButton,
  passwordInput,
  "Afficher le mot de passe",
  "Masquer le mot de passe"
);

loadConfiguration().catch((error) => {
  console.error("FileLink for Gokapi configuration load failed", error);
  setStatus("error", "La configuration enregistrée n’a pas pu être chargée.");
});
