<#
.SYNOPSIS
  Install pnpm (if missing), install workspace dependencies, and build packages.

.EXAMPLE
  ./scripts/bootstrap.ps1
  ./scripts/bootstrap.ps1 -SkipBuild
#>

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$app = Join-Path $root "application"

function Test-CommandExists($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-CommandExists "pnpm")) {
  Write-Host "==> pnpm not found, installing globally via npm"
  npm install -g pnpm
}

Write-Host "==> pnpm version: $(pnpm --version)"

Set-Location $app

Write-Host "==> Installing workspace dependencies"
pnpm install

if (-not $SkipBuild) {
  Write-Host "==> Building react-debugmachine wrapper package"
  pnpm --filter "./packages/react-debugmachine" run build
}

Write-Host ""
Write-Host "==> Bootstrap complete."
Write-Host "Install '@henriquecosta/react-debugmachine' in a consuming app, or run 'pnpm dev' from application/ to start the demo app."
