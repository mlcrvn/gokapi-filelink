// SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
// SPDX-License-Identifier: MPL-2.0

"use strict";

const ACCOUNTS_STORE = "accounts";
const UPLOAD_RECORDS_STORE = "uploadRecords";
const activeUploads = new Map();
const Gokapi = globalThis.GokapiFileLink;

async function getObjectStore(name) {
  const stored = await browser.storage.local.get({ [name]: {} });
  const value = stored[name];
  return value && typeof value === "object" ? value : {};
}

async function setObjectStore(name, value) {
  await browser.storage.local.set({ [name]: value });
}

async function getAccountConfig(accountId) {
  const accounts = await getObjectStore(ACCOUNTS_STORE);
  return accounts[accountId];
}

function safeResponseMessage(text) {
  return String(text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

async function responseError(response) {
  let details = "";
  try {
    const text = await response.text();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        details = parsed.error || parsed.message || parsed.Result || text;
      } catch {
        details = text;
      }
    }
  } catch {
    // The HTTP status remains sufficient if the body cannot be read.
  }

  const suffix = safeResponseMessage(details);
  return new Error(
    `Gokapi a répondu ${response.status}${suffix ? ` : ${suffix}` : "."}`
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw await responseError(response);
  }
  try {
    return await response.json();
  } catch {
    throw new Error("Gokapi a renvoyé une réponse JSON invalide.");
  }
}

function apiHeaders(apiKey, extra = {}) {
  return {
    accept: "application/json",
    apikey: apiKey,
    ...extra
  };
}

async function testConnection(untrustedConfig) {
  const config = Gokapi.normalizeConfig(untrustedConfig);
  const headers = apiHeaders(config.apiKey);

  const versionInfo = await fetchJson(
    Gokapi.apiUrl(config.serverUrl, "info/version"),
    { headers }
  );
  const uploadInfo = await fetchJson(
    Gokapi.apiUrl(config.serverUrl, "info/config"),
    { headers }
  );

  const maxFilesizeMb = Number(uploadInfo?.MaxFilesize);
  const maxFileSizeBytes =
    Number.isFinite(maxFilesizeMb) && maxFilesizeMb > 0
      ? Math.floor(maxFilesizeMb * 1024 * 1024)
      : -1;

  return {
    ok: true,
    version: String(versionInfo?.Version ?? "inconnue"),
    endToEndEncryptionEnabled: Boolean(
      versionInfo?.EndToEndEncryptionEnabled
    ),
    maxFileSizeBytes
  };
}

async function saveUploadRecord(accountId, fileId, record) {
  const records = await getObjectStore(UPLOAD_RECORDS_STORE);
  records[Gokapi.uploadRecordKey(accountId, fileId)] = record;
  await setObjectStore(UPLOAD_RECORDS_STORE, records);
}

async function getUploadRecord(accountId, fileId) {
  const records = await getObjectStore(UPLOAD_RECORDS_STORE);
  return records[Gokapi.uploadRecordKey(accountId, fileId)];
}

async function removeUploadRecord(accountId, fileId) {
  const records = await getObjectStore(UPLOAD_RECORDS_STORE);
  delete records[Gokapi.uploadRecordKey(accountId, fileId)];
  await setObjectStore(UPLOAD_RECORDS_STORE, records);
}

async function uploadFile(account, fileInfo) {
  const config = await getAccountConfig(account.id);
  if (!config) {
    return { error: "Le compte Gokapi n’est pas configuré." };
  }

  if (
    Number(config.maxFileSizeBytes) > 0 &&
    fileInfo.data.size > Number(config.maxFileSizeBytes)
  ) {
    return { error: "Ce fichier dépasse la taille maximale autorisée par Gokapi." };
  }

  const requestKey = Gokapi.uploadRecordKey(account.id, fileInfo.id);
  const controller = new AbortController();
  activeUploads.set(requestKey, controller);

  const form = new FormData();
  form.append("allowedDownloads", String(config.allowedDownloads));
  form.append("expiryDays", String(config.expiryDays));
  form.append(
    "password",
    config.protectWithPassword ? config.password : ""
  );
  form.append("file", fileInfo.data, fileInfo.name);

  try {
    const versionInfo = await fetchJson(
      Gokapi.apiUrl(config.serverUrl, "info/version"),
      {
        headers: apiHeaders(config.apiKey),
        signal: controller.signal
      }
    );
    if (versionInfo?.EndToEndEncryptionEnabled) {
      return {
        error:
          "L’upload est bloqué : cette instance Gokapi utilise le chiffrement E2E."
      };
    }

    const result = await fetchJson(
      Gokapi.apiUrl(config.serverUrl, "files/add"),
      {
        method: "POST",
        headers: apiHeaders(config.apiKey),
        body: form,
        signal: controller.signal
      }
    );

    if (result?.Result && result.Result !== "OK") {
      throw new Error(`Gokapi a refusé l’upload : ${result.Result}`);
    }

    const file = result?.FileInfo;
    const record = Gokapi.makeUploadRecord(
      file,
      config.serverUrl,
      fileInfo.name
    );
    await saveUploadRecord(account.id, fileInfo.id, record);

    return {
      url: record.url,
      templateInfo: Gokapi.buildTemplateInfo(file)
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { aborted: true };
    }
    console.error("FileLink for Gokapi upload failed", error);
    return { error: error?.message || "L’upload vers Gokapi a échoué." };
  } finally {
    activeUploads.delete(requestKey);
  }
}

async function deleteFile(account, fileId) {
  const [config, record] = await Promise.all([
    getAccountConfig(account.id),
    getUploadRecord(account.id, fileId)
  ]);
  if (!config || !record) {
    return;
  }

  try {
    const response = await fetch(
      Gokapi.apiUrl(record.serverUrl || config.serverUrl, "files/delete"),
      {
        method: "DELETE",
        headers: apiHeaders(config.apiKey, { id: record.gokapiId })
      }
    );
    if (!response.ok && response.status !== 404) {
      throw await responseError(response);
    }
    await removeUploadRecord(account.id, fileId);
  } catch (error) {
    console.error("FileLink for Gokapi deletion failed", error);
  }
}

async function renameFile(account, fileId, newName) {
  const [config, record] = await Promise.all([
    getAccountConfig(account.id),
    getUploadRecord(account.id, fileId)
  ]);
  if (!config || !record) {
    return { error: "Le fichier Gokapi associé est introuvable." };
  }

  try {
    const file = await fetchJson(
      Gokapi.apiUrl(record.serverUrl || config.serverUrl, "files/duplicate"),
      {
        method: "POST",
        headers: apiHeaders(config.apiKey, {
          id: record.gokapiId,
          filename: newName,
          originalPassword: "true"
        })
      }
    );

    const renamedRecord = Gokapi.makeUploadRecord(
      file,
      record.serverUrl || config.serverUrl,
      newName
    );
    await saveUploadRecord(account.id, fileId, renamedRecord);
    return { url: renamedRecord.url };
  } catch (error) {
    console.error("FileLink for Gokapi rename failed", error);
    return {
      error:
        error?.message ||
        "Le renommage nécessite les permissions API VIEW et UPLOAD."
    };
  }
}

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "gokapi:testConnection") {
    return testConnection(message.config);
  }
  return undefined;
});

browser.cloudFile.onAccountAdded.addListener(async (account) => {
  await browser.cloudFile.updateAccount(account.id, {
    configured: false,
    spaceRemaining: -1,
    spaceUsed: -1,
    uploadSizeLimit: -1
  });
});

browser.cloudFile.onAccountDeleted.addListener(async (accountId) => {
  const accounts = await getObjectStore(ACCOUNTS_STORE);
  delete accounts[accountId];

  const records = await getObjectStore(UPLOAD_RECORDS_STORE);
  const prefix = `${accountId}:`;
  for (const key of Object.keys(records)) {
    if (key.startsWith(prefix)) {
      delete records[key];
    }
  }

  await browser.storage.local.set({
    [ACCOUNTS_STORE]: accounts,
    [UPLOAD_RECORDS_STORE]: records
  });
});

browser.cloudFile.onFileUpload.addListener(uploadFile);

browser.cloudFile.onFileUploadAbort.addListener((account, fileId) => {
  const key = Gokapi.uploadRecordKey(account.id, fileId);
  activeUploads.get(key)?.abort();
});

browser.cloudFile.onFileDeleted.addListener(deleteFile);
browser.cloudFile.onFileRename.addListener(renameFile);
