// SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
// SPDX-License-Identifier: MPL-2.0

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf8")
);
const packageMetadata = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);

test("manifest declares a Thunderbird MV3 cloudFile provider", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "FileLink for Gokapi");
  assert.equal(manifest.version, "1.0.1");
  assert.equal(manifest.author, "Mathieu Lécrivain");
  assert.equal(
    manifest.homepage_url,
    "https://github.com/mlcrvn/gokapi-filelink"
  );
  assert.equal(
    manifest.browser_specific_settings.gecko.id,
    "gokapi-filelink@mlcrvn.net"
  );
  assert.equal(manifest.cloud_file.name, "Gokapi");
  assert.equal(manifest.cloud_file.management_url, "management.html");
  assert.equal(
    manifest.browser_specific_settings.gecko.strict_min_version,
    "128.0"
  );
});

test("every manifest file reference exists", () => {
  const references = [
    ...manifest.background.scripts,
    manifest.cloud_file.management_url,
    ...Object.values(manifest.icons)
  ];

  for (const reference of references) {
    assert.equal(
      fs.existsSync(path.join(root, reference)),
      true,
      `${reference} should exist`
    );
  }
});

test("host access is dynamic at runtime and limited to HTTPS", () => {
  assert.deepEqual(manifest.host_permissions, ["https://*/*"]);
});

test("project declares and includes the Mozilla Public License 2.0", () => {
  assert.equal(packageMetadata.license, "MPL-2.0");
  const license = fs.readFileSync(path.join(root, "LICENSE"), "utf8");
  assert.match(license, /^Mozilla Public License Version 2\.0/);
  assert.match(license, /Exhibit B - "Incompatible With Secondary Licenses" Notice/);
});
