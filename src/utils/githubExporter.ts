import { AppRecord, HexOSUpdatePayload } from '../types';
import { generatePermanentJsonPayload, generateStoreAppsJson } from './storage';

export interface ExportedFile {
  path: string;
  content: string;
  description: string;
}

export function generateGitHubRepoFiles(apps: AppRecord[]): ExportedFile[] {
  const files: ExportedFile[] = [];

  // 1. Generate consolidated apps.json for PDzOS Store Marketplace
  const storeCatalog = generateStoreAppsJson(apps);
  files.push({
    path: `apps.json`,
    content: JSON.stringify(storeCatalog, null, 2),
    description: `Consolidated application catalog for PDzOS Store marketplace`
  });

  // 2. Generate apps/{packageName}.json (Permanent endpoints)
  apps.forEach(app => {
    const payload: HexOSUpdatePayload = generatePermanentJsonPayload(app);
    files.push({
      path: `apps/${app.packageName}.json`,
      content: JSON.stringify(payload, null, 2),
      description: `Permanent JSON endpoint for ${app.name} (${app.packageName})`
    });

    // 2. Generate releases/{shortName}/{version}.json
    const shortName = app.packageName.split('.').pop() || app.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    app.releases.forEach(rel => {
      const releasePayload = {
        appPackageName: app.packageName,
        appName: app.name,
        version: rel.version,
        versionCode: rel.versionCode,
        apkUrl: rel.directDownloadUrl || rel.apkUrl,
        originalApkUrl: rel.apkUrl,
        apkSource: rel.apkSource,
        fileSize: rel.fileSize,
        minimumAndroid: rel.minimumAndroid,
        forceUpdate: rel.forceUpdate,
        channel: rel.channel,
        releaseDate: rel.releaseDate,
        changelog: rel.changelog,
        status: rel.status,
      };

      files.push({
        path: `releases/${shortName}/${rel.version}.json`,
        content: JSON.stringify(releasePayload, null, 2),
        description: `Release archive for ${app.name} v${rel.version}`
      });
    });
  });

  // 3. GitHub Actions workflow
  files.push({
    path: `.github/workflows/validate-updates.yml`,
    content: `name: Validate PdzOS Updates JSON

on:
  push:
    paths:
      - 'apps/**.json'
      - 'releases/**.json'
  pull_request:
    paths:
      - 'apps/**.json'
      - 'releases/**.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Validate All JSON Files
        run: |
          echo "Validating PdzOS Update JSON structures..."
          python3 -c "
          import json, glob, sys, re

          success = True
          for path in glob.glob('apps/*.json'):
              print(f'Checking {path}...')
              try:
                  with open(path) as f:
                      data = json.load(f)
                  assert data.get('success') is True, 'Field success must be true'
                  assert 'app' in data and 'packageName' in data['app'], 'app.packageName missing'
                  assert 'update' in data and 'versionCode' in data['update'], 'update.versionCode missing'
                  assert isinstance(data['update']['versionCode'], int), 'versionCode must be integer'
                  assert data['update']['apkUrl'].startswith('http'), 'apkUrl must be valid URL'
                  print(f'  ✓ Validated {path} (versionCode: {data[\"update\"][\"versionCode\"]})')
              except Exception as e:
                  print(f'  ✗ ERROR in {path}: {e}', file=sys.stderr)
                  success = False

          if not success:
              sys.exit(1)
          print('All PdzOS metadata files passed validation!')
          "
`,
    description: 'Automated CI workflow to validate JSON syntax and schema integrity on push'
  });

  // 4. README.md for the GitHub repo
  files.push({
    path: `README.md`,
    content: `# PdzOS App Update Metadata Repository

Central, zero-cost update storage for PdzOS Android applications.

## Directory Structure
- \`apps/\`: Contains the permanent JSON files for each application.
- \`releases/\`: Contains historical version JSON files.
- \`.github/workflows/\`: CI validation workflow to prevent syntax mistakes.

## Permanent Endpoints
${apps.map(a => `- **${a.name}** (\`${a.packageName}\`): \`apps/${a.packageName}.json\``).join('\n')}

This repository is synced with Cloudflare Pages / GitHub Pages.
`,
    description: 'Documentation for GitHub metadata repository'
  });

  return files;
}

export function downloadFile(filename: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
