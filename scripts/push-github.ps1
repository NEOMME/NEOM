# Push Neom to GitHub as NEOMME (not another account)
# Usage: $env:GH_TOKEN = "your_pat_with_contents_write"; .\scripts\push-github.ps1

if (-not $env:GH_TOKEN) {
  Write-Host "Set your NEOMME token first:" -ForegroundColor Yellow
  Write-Host '  $env:GH_TOKEN = "github_pat_..."' -ForegroundColor Cyan
  Write-Host "Token needs Contents: Read and write on NEOMME/NEOM"
  exit 1
}

Set-Location (Split-Path $PSScriptRoot -Parent)

# Bypass Windows Credential Manager (avoids wrong account like zackie2)
git -c credential.helper= push "https://x-access-token:$($env:GH_TOKEN)@github.com/NEOMME/NEOM.git" main

if ($LASTEXITCODE -eq 0) {
  git branch --set-upstream-to=origin/main main 2>$null
  Write-Host "Pushed to https://github.com/NEOMME/NEOM" -ForegroundColor Green
} else {
  Write-Host "Push failed. Regenerate token with Contents write permission." -ForegroundColor Red
}
