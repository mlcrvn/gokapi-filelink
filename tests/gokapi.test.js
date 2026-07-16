// SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
// SPDX-License-Identifier: MPL-2.0

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Gokapi = require("../gokapi.js");

test("normalizeBaseUrl keeps a reverse-proxy path and removes trailing syntax", () => {
  assert.equal(
    Gokapi.normalizeBaseUrl(" https://files.example.test/gokapi/?ignored=1#top "),
    "https://files.example.test/gokapi"
  );
});

test("normalizeBaseUrl rejects insecure and credentialed URLs", () => {
  assert.throws(
    () => Gokapi.normalizeBaseUrl("http://files.example.test"),
    /HTTPS/
  );
  assert.throws(
    () => Gokapi.normalizeBaseUrl("https://user:pass@files.example.test"),
    /identifiants/
  );
});

test("apiUrl appends the Gokapi API path", () => {
  assert.equal(
    Gokapi.apiUrl("https://files.example.test/base", "/files/add"),
    "https://files.example.test/base/api/files/add"
  );
});

test("normalizeConfig applies defaults and validates protected uploads", () => {
  assert.deepEqual(
    Gokapi.normalizeConfig({
      serverUrl: "https://files.example.test",
      apiKey: " secret "
    }),
    {
      serverUrl: "https://files.example.test",
      apiKey: "secret",
      expiryDays: 14,
      allowedDownloads: 0,
      protectWithPassword: false,
      password: ""
    }
  );

  assert.throws(
    () =>
      Gokapi.normalizeConfig({
        serverUrl: "https://files.example.test",
        apiKey: "secret",
        protectWithPassword: true,
        password: ""
      }),
    /mot de passe/
  );
});

test("buildTemplateInfo omits service_url to avoid Thunderbird's Learn more footer", () => {
  assert.deepEqual(
    Gokapi.buildTemplateInfo(
      {
        ExpireAt: 1700000000,
        DownloadsRemaining: 4,
        UnlimitedTime: false,
        UnlimitedDownloads: false,
        IsPasswordProtected: true
      }
    ),
    {
      service_name: "Gokapi",
      download_password_protected: true,
      download_expiry_date: { timestamp: 1700000000000 },
      download_limit: 4
    }
  );
  assert.equal(
    Object.hasOwn(Gokapi.buildTemplateInfo({}), "service_url"),
    false
  );
});

test("makeUploadRecord preserves the public URL and server origin", () => {
  const record = Gokapi.makeUploadRecord(
    {
      Id: "abc123",
      UrlDownload: "https://files.example.test/d?id=abc123",
      Name: "report.pdf"
    },
    "https://files.example.test/",
    "report.pdf"
  );

  assert.equal(record.gokapiId, "abc123");
  assert.equal(record.url, "https://files.example.test/d?id=abc123");
  assert.equal(record.serverUrl, "https://files.example.test");
  assert.equal(record.name, "report.pdf");
  assert.equal(typeof record.createdAt, "number");
});
