import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'https://github.com/playcanvas/skills.git';
const REF = 'v0.1.0';
const SRC = 'plugins/engine/skills';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'skills');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-skills-'));

execFileSync('git', ['clone', '--depth', '1', '--branch', REF, REPO, tmp], { stdio: 'inherit' });

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(path.join(tmp, SRC), dest, { recursive: true });

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`synced ${dest} from ${REF}`);
