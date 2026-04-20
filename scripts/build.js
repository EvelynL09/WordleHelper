import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const HTML_FILE = path.join(ROOT_DIR, 'index.html');
const DIST_HTML_FILE = path.join(DIST_DIR, 'index.html');

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const commitRef = process.env.COMMIT_REF || process.env.GIT_COMMIT || 'local-dev';
const branch = process.env.BRANCH || 'local-dev';
const buildTimestamp = process.env.BUILD_TIMESTAMP || Math.floor(Date.now() / 1000).toString();

let buildTime;
const ts = parseInt(buildTimestamp);
if (ts > 100000000000) {
    buildTime = new Date(ts).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
} else {
    buildTime = new Date(ts * 1000).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

let htmlContent = fs.readFileSync(HTML_FILE, 'utf8');

htmlContent = htmlContent.replace(/{{APP_VERSION}}/g, version);
htmlContent = htmlContent.replace(/{{GIT_COMMIT}}/g, commitRef);
htmlContent = htmlContent.replace(/{{BUILD_TIME}}/g, buildTime);
htmlContent = htmlContent.replace(/{{DEPLOY_BRANCH}}/g, branch);

const cssDir = path.join(DIST_DIR, 'css');
const jsDir = path.join(DIST_DIR, 'js');

if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}

fs.copyFileSync(path.join(ROOT_DIR, 'css', 'style.css'), path.join(cssDir, 'style.css'));
fs.copyFileSync(path.join(ROOT_DIR, 'css', 'components.css'), path.join(cssDir, 'components.css'));

const jsFiles = ['constants.js', 'utils/storage.js', 'utils/parser.js', 'utils/validation.js',
    'components/status.js', 'components/config.js', 'components/guesses.js', 'components/letters.js',
    'components/validator.js', 'components/share.js', 'script.js'];

if (fs.existsSync(jsDir)) {
    fs.rmSync(jsDir, { recursive: true, force: true });
    fs.mkdirSync(jsDir, { recursive: true });
}

jsFiles.forEach(file => {
    const src = path.join(ROOT_DIR, 'js', file);
    const dest = path.join(jsDir, file);
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
});

fs.writeFileSync(DIST_HTML_FILE, htmlContent, 'utf8');

console.log('Build completed successfully!');
console.log(`Version: ${version}`);
console.log(`Git Commit: ${commitRef}`);
console.log(`Build Time: ${buildTime}`);
console.log(`Branch: ${branch}`);
