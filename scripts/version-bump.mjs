import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const newVersion = pkg.version;

// Update manifest.json version
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const minAppVersion = manifest.minAppVersion;
manifest.version = newVersion;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');

// Add new version entry to versions.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
versions[newVersion] = minAppVersion;
writeFileSync('versions.json', JSON.stringify(versions, null, 2) + '\n');

// Stage the modified files so npm version includes them in the version commit
import { execSync } from 'child_process';
execSync('git add manifest.json versions.json');

console.log(`Bumped to ${newVersion} (minAppVersion: ${minAppVersion})`);
