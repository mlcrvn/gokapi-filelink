# SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
# SPDX-License-Identifier: MPL-2.0

param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\..\outputs")
)

$ErrorActionPreference = "Stop"
$manifest = Get-Content -Raw (Join-Path $PSScriptRoot "manifest.json") | ConvertFrom-Json
$version = $manifest.version

$output = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $output | Out-Null

$artifactBase = "FileLinkForGokapi-$version"
$xpiPath = Join-Path $output "$artifactBase.xpi"
$xpiZipPath = Join-Path $output "$artifactBase.zip"
$sourcePath = Join-Path $output "$artifactBase-source.zip"
$checksumPath = Join-Path $output "$artifactBase-SHA256.txt"

foreach ($path in @($xpiPath, $xpiZipPath, $sourcePath, $checksumPath)) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force
  }
}

$extensionFiles = @(
  "manifest.json",
  "gokapi.js",
  "background.js",
  "management.html",
  "management.css",
  "management.js",
  "icons",
  "LICENSE",
  "NOTICE.md"
) | ForEach-Object { Join-Path $PSScriptRoot $_ }

Compress-Archive -Path $extensionFiles -DestinationPath $xpiZipPath -CompressionLevel Optimal
Move-Item -LiteralPath $xpiZipPath -Destination $xpiPath

$sourceFiles = @(
  "manifest.json",
  "gokapi.js",
  "background.js",
  "management.html",
  "management.css",
  "management.js",
  "icons",
  "LICENSE",
  "README.md",
  "ATN_LISTING.md",
  "NOTICE.md",
  "PRIVACY.md",
  "package.json",
  "build.ps1",
  "tests"
) | ForEach-Object { Join-Path $PSScriptRoot $_ }

Compress-Archive -Path $sourceFiles -DestinationPath $sourcePath -CompressionLevel Optimal

$hashes = Get-FileHash -Algorithm SHA256 $xpiPath, $sourcePath
$hashes |
  ForEach-Object { "$($_.Hash)  $([System.IO.Path]::GetFileName($_.Path))" } |
  Set-Content -LiteralPath $checksumPath -Encoding ascii

$hashes | Select-Object Path, Hash
