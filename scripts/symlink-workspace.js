const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');  // 从 scripts/ 目录向上一级到项目根目录
const binDir = path.join(workspaceRoot, 'node_modules/.bin');
fs.mkdirSync(binDir, { recursive: true });

// 扫描所有 workspace 包
const packagesDir = path.join(workspaceRoot, 'packages');
const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => path.join(packagesDir, dirent.name));

packages.forEach(pkgPath => {
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (!pkg.bin) return;

  const distPath = pkg.publishConfig?.directory || 'dist';
  const pkgDir = path.join(pkgPath, distPath);

  Object.entries(pkg.bin).forEach(([cmd, binFile]) => {
    const binSource = path.join(pkgDir, binFile);
    const binTarget = path.join(binDir, cmd);

    if (fs.existsSync(binSource)) {
      try {
        if (fs.existsSync(binTarget)) {
          fs.unlinkSync(binTarget);
        }
        const relativePath = path.relative(path.dirname(binTarget), binSource);
        fs.symlinkSync(relativePath, binTarget);
        console.log(`✓ Linked ${cmd} -> ${relativePath}`);
      } catch (e) {
        console.error(`✗ Failed to link ${cmd}:`, e.message);
      }
    }
  });
});