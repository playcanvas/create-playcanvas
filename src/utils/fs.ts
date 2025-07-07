import fs from 'node:fs'
import path from 'node:path'

// Remove trailing slashes from a directory string
export function formatTargetDir(targetDir: string): string {
  return targetDir.trim().replace(/\/+$/g, '')
}

// Check if a directory is effectively empty (ignoring a lone .git folder)
export function isEmpty(dirPath: string): boolean {
  const files = fs.readdirSync(dirPath)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

// Recursively delete all files/folders inside a directory except .git
export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') continue
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

// Copy a file or directory recursively
export function copy(src: string, dest: string): void {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

// Recursively copy a directory
export function copyDir(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
} 