import fs from 'node:fs';
import path from 'node:path';

// Remove trailing slashes from a directory string
export const formatTargetDir = (targetDir: string) => {
    return targetDir.trim().replace(/\/+$/g, '');
};

// Check if a directory is effectively empty (ignoring a lone .git folder)
export const isEmpty = (dirPath: string) => {
    const files = fs.readdirSync(dirPath);
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
};

// Recursively delete all files/folders inside a directory except .git
export const emptyDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;

    for (const file of fs.readdirSync(dir)) {
        if (file === '.git') continue;
        fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
    }
};

// Copy a file or directory recursively
export const copy = (src: string, dest: string) => {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
};

// Recursively copy a directory
export const copyDir = (srcDir: string, destDir: string) => {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file);
        const destFile = path.resolve(destDir, file);
        copy(srcFile, destFile);
    }
};
