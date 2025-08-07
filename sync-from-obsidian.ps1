# Obsidianから記事を同期するスクリプト
param(
    [string]$ObsidianPath = "C:\Users\koba1\OneDrive\ドキュメント\vault\blog",
    [string]$ContentPath = ".\content"
)

Write-Host "Syncing from Obsidian vault to Quartz content..."

# Obsidianのvaultから特定のファイルをコピー
if (Test-Path $ObsidianPath) {
    # .mdファイルをコピー（除外したいファイルがあれば追加）
    Get-ChildItem -Path $ObsidianPath -Filter "*.md" | ForEach-Object {
        $destPath = Join-Path $ContentPath $_.Name
        Copy-Item $_.FullName $destPath -Force
        Write-Host "Copied: $($_.Name)"
    }
    
    Write-Host "Sync completed!"
    Write-Host "Next steps:"
    Write-Host "1. git add content/"
    Write-Host "2. git commit -m 'Update blog posts from Obsidian'"
    Write-Host "3. git push"
} else {
    Write-Error "Obsidian vault path not found: $ObsidianPath"
}