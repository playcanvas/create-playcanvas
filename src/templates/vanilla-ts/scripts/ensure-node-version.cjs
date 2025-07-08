const semver = require('semver');
const pkg = require('../package.json');

const requiredVersion = pkg.engines.node;
const currentVersion = process.version;

if (!semver.satisfies(currentVersion, requiredVersion)) {
  console.error(`\n❌ Unsupported Node.js version: ${currentVersion}`);
  console.error(`Required: ${requiredVersion}`);
  console.error('Please upgrade your Node.js to continue.\n');
  process.exit(1);
}