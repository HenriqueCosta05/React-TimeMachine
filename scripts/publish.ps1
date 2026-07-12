<#
.SYNOPSIS
  Version-bump and publish the publishable packages (shared, recorder, player) to npm.

.EXAMPLE
  ./scripts/publish.ps1 -Bump 1.0.0
  ./scripts/publish.ps1 -Bump patch
  ./scripts/publish.ps1 -Bump minor -DryRun
#>

param(
  [string]$Bump = "patch",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Invoke-Checked {
  param([string]$Description, [scriptblock]$Command)
  Write-Host "==> $Description"
  & $Command
  if ($LASTEXITCODE -ne 0) {
    Write-Error "FAILED: $Description (exit code $LASTEXITCODE)"
    exit $LASTEXITCODE
  }
}

$root = Split-Path -Parent $PSScriptRoot
$app = Join-Path $root "application"

Set-Location $app

Invoke-Checked "Installing dependencies" { pnpm install --frozen-lockfile }
Invoke-Checked "Typecheck" { pnpm -r run typecheck }
Invoke-Checked "Test" { pnpm -r run test }
Invoke-Checked "Build" { pnpm -r run build }
Invoke-Checked "Bumping version ($Bump) for publishable packages" {
  pnpm --filter "./packages/*" exec -- npm version $Bump --no-git-tag-version
}

$sharedPkgPath = Join-Path $app "packages/shared/package.json"
$newVersion = (Get-Content $sharedPkgPath -Raw | ConvertFrom-Json).version
Write-Host "==> New version: $newVersion"

$rootPkgPath = Join-Path $app "package.json"
$rootPkg = Get-Content $rootPkgPath -Raw | ConvertFrom-Json
$rootPkg.version = $newVersion
($rootPkg | ConvertTo-Json -Depth 20) | Set-Content $rootPkgPath

if ($DryRun) {
  Invoke-Checked "Dry run - publishing skipped" {
    pnpm -r publish --access public --no-git-checks --dry-run
  }
} else {
  Invoke-Checked "Publishing to npm" {
    pnpm -r publish --access public --no-git-checks
  }
}

Write-Host "==> Done. Published version $newVersion"
