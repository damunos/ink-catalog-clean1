# -------------------------------------------
# PowerShell script: rewrite-lfs.ps1
# -------------------------------------------

Write-Host "`n👉 Starting Git LFS history rewrite..."

Write-Host "`n✅ Checking Java installation..."
try {
    java -version
} catch {
    Write-Host "`n❌ Java is not installed or not in PATH."
    exit 1
}

Write-Host "`n✅ Running BFG for '*.jpg'..."
java -jar "C:\Users\Peter\Downloads\bfg.jar" --convert-to-git-lfs '*.jpg' --no-blob-protection

Write-Host "`n✅ Running BFG for '*.png'..."
java -jar "C:\Users\Peter\Downloads\bfg.jar" --convert-to-git-lfs '*.png' --no-blob-protection

Write-Host "`n✅ Cleaning up reflog and garbage..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "`n✅ Adding .gitattributes to stage..."
git add .gitattributes

# ✅ This is the fixed commit check:
Write-Host "`n✅ Checking if there is anything to commit..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "Rewrite history: move images to Git LFS"
    Write-Host "`n✅ Commit created."
} else {
    Write-Host "`nℹ️ Nothing to commit. Working tree clean."
}

Write-Host "`n🚀 Pushing rewritten history with --force..."
git push origin main --force

Write-Host "`n✅ DONE! Check your remote repo — images should now be under LFS."
