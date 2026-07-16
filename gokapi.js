// SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
// SPDX-License-Identifier: MPL-2.0

(function exposeGokapiFileLink(globalScope) {
  "use strict";

  const MAX_EXPIRY_DAYS = 3650;
  const MAX_DOWNLOADS = 1000000;

  function normalizeBaseUrl(value) {
    const rawValue = String(value ?? "").trim();
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
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path === "/" ? "" : path}`;
  }

  function apiUrl(baseUrl, endpoint) {
    const base = normalizeBaseUrl(baseUrl);
    const path = String(endpoint ?? "").replace(/^\/+/, "");
    return `${base}/api/${path}`;
  }

  function boundedInteger(value, label, maximum) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > maximum) {
      throw new Error(`${label} doit être un entier compris entre 0 et ${maximum}.`);
    }
    return parsed;
  }

  function normalizeConfig(config) {
    const normalized = {
      serverUrl: normalizeBaseUrl(config?.serverUrl),
      apiKey: String(config?.apiKey ?? "").trim(),
      expiryDays: boundedInteger(
        config?.expiryDays ?? 14,
        "L’expiration",
        MAX_EXPIRY_DAYS
      ),
      allowedDownloads: boundedInteger(
        config?.allowedDownloads ?? 0,
        "Le nombre de téléchargements",
        MAX_DOWNLOADS
      ),
      protectWithPassword: Boolean(config?.protectWithPassword),
      password: String(config?.password ?? "")
    };

    if (!normalized.apiKey) {
      throw new Error("La clé API est obligatoire.");
    }
    if (normalized.protectWithPassword && !normalized.password) {
      throw new Error("Saisissez le mot de passe à utiliser pour les téléchargements.");
    }

    return normalized;
  }

  function buildTemplateInfo(fileInfo) {
    const templateInfo = {
      service_name: "Gokapi",
      download_password_protected: Boolean(fileInfo?.IsPasswordProtected)
    };

    const expiresAt = Number(fileInfo?.ExpireAt);
    if (!fileInfo?.UnlimitedTime && Number.isFinite(expiresAt) && expiresAt > 0) {
      templateInfo.download_expiry_date = {
        timestamp: expiresAt * 1000
      };
    }

    const downloadsRemaining = Number(fileInfo?.DownloadsRemaining);
    if (
      !fileInfo?.UnlimitedDownloads &&
      Number.isInteger(downloadsRemaining) &&
      downloadsRemaining >= 0
    ) {
      templateInfo.download_limit = downloadsRemaining;
    }

    return templateInfo;
  }

  function makeUploadRecord(fileInfo, serverUrl, name) {
    if (!fileInfo?.Id || !fileInfo?.UrlDownload) {
      throw new Error("La réponse de Gokapi ne contient pas les informations du fichier.");
    }
    return {
      gokapiId: String(fileInfo.Id),
      url: String(fileInfo.UrlDownload),
      name: String(name ?? fileInfo.Name ?? ""),
      serverUrl: normalizeBaseUrl(serverUrl),
      createdAt: Date.now()
    };
  }

  function uploadRecordKey(accountId, fileId) {
    return `${String(accountId)}:${String(fileId)}`;
  }

  const api = {
    MAX_EXPIRY_DAYS,
    MAX_DOWNLOADS,
    normalizeBaseUrl,
    apiUrl,
    normalizeConfig,
    buildTemplateInfo,
    makeUploadRecord,
    uploadRecordKey
  };

  globalScope.GokapiFileLink = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(globalThis);
