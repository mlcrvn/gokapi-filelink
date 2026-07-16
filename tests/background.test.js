// SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
// SPDX-License-Identifier: MPL-2.0

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

require("../gokapi.js");

const listeners = {};
const requests = [];
let serverE2E = false;
const storageState = {
  accounts: {
    "account-a": {
      serverUrl: "https://files.example.test/gokapi",
      apiKey: "test-key",
      expiryDays: 14,
      allowedDownloads: 5,
      protectWithPassword: true,
      password: "download-secret",
      maxFileSizeBytes: 1048576
    }
  },
  uploadRecords: {}
};

function event(name) {
  return {
    addListener(listener) {
      listeners[name] = listener;
    }
  };
}

global.browser = {
  storage: {
    local: {
      async get(query) {
        if (typeof query === "string") {
          return { [query]: storageState[query] };
        }
        const result = {};
        for (const [key, fallback] of Object.entries(query || {})) {
          result[key] = storageState[key] ?? fallback;
        }
        return result;
      },
      async set(values) {
        Object.assign(storageState, values);
      }
    }
  },
  runtime: {
    onMessage: event("message")
  },
  cloudFile: {
    updateAccount: async () => undefined,
    onAccountAdded: event("accountAdded"),
    onAccountDeleted: event("accountDeleted"),
    onFileUpload: event("upload"),
    onFileUploadAbort: event("abort"),
    onFileDeleted: event("deleted"),
    onFileRename: event("rename")
  }
};

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return data;
    },
    async text() {
      return JSON.stringify(data);
    }
  };
}

global.fetch = async (url, options = {}) => {
  requests.push({ url: String(url), options });

  if (String(url).endsWith("/api/info/version")) {
    return jsonResponse({
      Version: "2.2.5",
      EndToEndEncryptionEnabled: serverE2E
    });
  }
  if (String(url).endsWith("/api/info/config")) {
    return jsonResponse({ MaxFilesize: 100, MaxChunksize: 40 });
  }
  if (String(url).endsWith("/api/files/add")) {
    return jsonResponse({
      Result: "OK",
      FileInfo: {
        Id: "gokapi-123",
        Name: "rapport.pdf",
        UrlDownload: "https://files.example.test/d?id=gokapi-123",
        ExpireAt: 1700000000,
        DownloadsRemaining: 5,
        UnlimitedTime: false,
        UnlimitedDownloads: false,
        IsPasswordProtected: true
      }
    });
  }
  if (String(url).endsWith("/api/files/delete")) {
    return jsonResponse({ Result: "OK" });
  }
  if (String(url).endsWith("/api/files/duplicate")) {
    return jsonResponse({
      Id: "gokapi-456",
      Name: "rapport-final.pdf",
      UrlDownload: "https://files.example.test/d?id=gokapi-456"
    });
  }
  return jsonResponse({ error: "unexpected request" }, 500);
};

require("../background.js");

test("connection test reads Gokapi version and upload limit", async () => {
  const result = await listeners.message({
    type: "gokapi:testConnection",
    config: storageState.accounts["account-a"]
  });

  assert.deepEqual(result, {
    ok: true,
    version: "2.2.5",
    endToEndEncryptionEnabled: false,
    maxFileSizeBytes: 100 * 1024 * 1024
  });
  assert.equal(requests[0].options.headers.apikey, "test-key");
});

test("upload sends configured fields and returns Thunderbird template data", async () => {
  const result = await listeners.upload(
    { id: "account-a" },
    {
      id: 7,
      name: "rapport.pdf",
      data: new Blob(["pdf-content"], { type: "application/pdf" })
    }
  );

  assert.equal(result.url, "https://files.example.test/d?id=gokapi-123");
  assert.equal(result.templateInfo.service_name, "Gokapi");
  assert.equal(Object.hasOwn(result.templateInfo, "service_url"), false);
  assert.equal(result.templateInfo.download_limit, 5);
  assert.equal(result.templateInfo.download_password_protected, true);

  const request = requests.find(({ url }) => url.endsWith("/api/files/add"));
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.apikey, "test-key");
  assert.equal(request.options.body.get("expiryDays"), "14");
  assert.equal(request.options.body.get("allowedDownloads"), "5");
  assert.equal(request.options.body.get("password"), "download-secret");
  assert.equal(
    storageState.uploadRecords["account-a:7"].gokapiId,
    "gokapi-123"
  );
});

test("upload is blocked if the server enables end-to-end encryption later", async () => {
  serverE2E = true;
  const addRequestsBefore = requests.filter(({ url }) =>
    url.endsWith("/api/files/add")
  ).length;

  const result = await listeners.upload(
    { id: "account-a" },
    {
      id: 8,
      name: "confidentiel.pdf",
      data: new Blob(["secret"], { type: "application/pdf" })
    }
  );

  const addRequestsAfter = requests.filter(({ url }) =>
    url.endsWith("/api/files/add")
  ).length;
  assert.match(result.error, /chiffrement E2E/);
  assert.equal(addRequestsAfter, addRequestsBefore);
  serverE2E = false;
});

test("rename duplicates the remote file and deletion removes the new record", async () => {
  const renamed = await listeners.rename(
    { id: "account-a" },
    7,
    "rapport-final.pdf"
  );
  assert.equal(renamed.url, "https://files.example.test/d?id=gokapi-456");

  const renameRequest = requests.find(({ url }) =>
    url.endsWith("/api/files/duplicate")
  );
  assert.equal(renameRequest.options.headers.id, "gokapi-123");
  assert.equal(renameRequest.options.headers.filename, "rapport-final.pdf");
  assert.equal(renameRequest.options.headers.originalPassword, "true");

  await listeners.deleted({ id: "account-a" }, 7);
  const deleteRequest = requests.find(({ url }) =>
    url.endsWith("/api/files/delete")
  );
  assert.equal(deleteRequest.options.method, "DELETE");
  assert.equal(deleteRequest.options.headers.id, "gokapi-456");
  assert.equal(storageState.uploadRecords["account-a:7"], undefined);
});
