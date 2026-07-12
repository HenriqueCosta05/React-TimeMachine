<#
.SYNOPSIS
  Version-bump and publish the react-debugmachine wrapper package to npm.

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

$wrapperFilter = "./packages/react-debugmachine..."

Invoke-Checked "Installing dependencies" { pnpm install --frozen-lockfile }
Invoke-Checked "Typecheck" { pnpm --filter $wrapperFilter run typecheck }
Invoke-Checked "Test" { pnpm --filter $wrapperFilter run test }
Invoke-Checked "Build" { pnpm --filter $wrapperFilter run build }
Invoke-Checked "Bumping version ($Bump) for wrapper package" {
  pnpm --filter "./packages/react-debugmachine" exec -- npm version $Bump --no-git-tag-version
}

$wrapperPkgPath = Join-Path $app "packages/react-debugmachine/package.json"
$newVersion = (Get-Content $wrapperPkgPath -Raw | ConvertFrom-Json).version
Write-Host "==> New version: $newVersion"

$rootPkgPath = Join-Path $app "package.json"
$rootPkg = Get-Content $rootPkgPath -Raw | ConvertFrom-Json
$rootPkg.version = $newVersion
($rootPkg | ConvertTo-Json -Depth 20) | Set-Content $rootPkgPath

if ($DryRun) {
  Invoke-Checked "Dry run - publishing skipped" {
    pnpm --filter "./packages/react-debugmachine" publish --access public --no-git-checks --dry-run
  }
} else {
  Invoke-Checked "Publishing to npm" {
    pnpm --filter "./packages/react-debugmachine" publish --access public --no-git-checks
  }
}

Write-Host "==> Done. Published version $newVersion"
