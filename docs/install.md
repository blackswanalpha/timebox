# TimeBox Installation Guide

## Table of Contents

- [Installing on Ubuntu](#installing-on-ubuntu)
- [Releasing via GitHub Actions](#releasing-via-github-actions)
- [OTA Updates](#ota-updates)

---

## Installing on Ubuntu

### From a GitHub Release

1. Go to the [Releases](https://github.com/blackswanalpha/timebox/releases) page.
2. Download the `.deb` file for your architecture (e.g. `TimeBox_x.x.x_amd64.deb`).
3. Install it:

```bash
sudo dpkg -i TimeBox_x.x.x_amd64.deb
```

4. If there are missing dependencies, fix them with:

```bash
sudo apt-get install -f
```

5. Launch TimeBox from the application menu or run:

```bash
time-box
```

### From a Local Build

#### Prerequisites

- Node.js (LTS)
- Rust (stable)
- System libraries:

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

#### Build and Install

```bash
cd timebox-main
npm install
npm run tauri build
```

The `.deb` package will be at:

```
src-tauri/target/release/bundle/deb/TimeBox_0.1.0_amd64.deb
```

Install it:

```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/TimeBox_0.1.0_amd64.deb
```

### Uninstalling

```bash
sudo dpkg -r time-box
```

---

## Releasing via GitHub Actions

The repository includes a CI/CD pipeline (`.github/workflows/release.yml`) that automatically builds cross-platform installers and publishes them as GitHub Releases.

### Step 1: Generate a Signing Keypair

The updater requires a signing keypair to verify update integrity. Run this once:

```bash
npx tauri signer generate -w ~/.tauri/timebox.key
```

You will be prompted for a password. Save the password securely.

This creates two files:
- `~/.tauri/timebox.key` — private key (keep secret)
- `~/.tauri/timebox.key.pub` — public key (already configured in `tauri.conf.json`)

### Step 2: Add GitHub Secrets

Go to your repository on GitHub: **Settings > Secrets and variables > Actions > New repository secret**.

Add two secrets:

| Secret Name | Value |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | The **second line** (base64 string) from `~/.tauri/timebox.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | The password you entered during key generation |

### Step 3: Create a Release

1. **Bump the version** in three files:

| File | Field |
|---|---|
| `package.json` | `"version"` |
| `src-tauri/tauri.conf.json` | `"version"` |
| `src-tauri/Cargo.toml` | `version` under `[package]` |

2. **Commit and tag**:

```bash
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "Bump version to v0.2.0"
git tag v0.2.0
git push origin main --tags
```

3. **GitHub Actions takes over**. The workflow:
   - Creates a draft GitHub Release
   - Builds the app on 4 platforms in parallel:
     - Ubuntu 22.04 (`.deb`, `.rpm`, `.AppImage`)
     - macOS Apple Silicon (`.dmg`)
     - macOS Intel (`.dmg`)
     - Windows (`.msi`, `.exe`)
   - Signs updater artifacts with your private key
   - Generates `latest.json` for OTA update detection
   - Publishes the release once all builds succeed

4. **Monitor the build** at: `https://github.com/blackswanalpha/timebox/actions`

### Troubleshooting CI

| Issue | Fix |
|---|---|
| `A public key has been found, but no private key` | Add `TAURI_SIGNING_PRIVATE_KEY` secret in GitHub repo settings |
| Build fails on Ubuntu | Check that `libwebkit2gtk-4.1-dev` and other system deps are in the workflow |
| Version mismatch error | Ensure `package.json`, `tauri.conf.json`, and `Cargo.toml` all have the same version |
| Release not published | Check the `publish-release` job logs in GitHub Actions |

---

## OTA Updates

Once a release is published, running TimeBox instances will automatically detect new versions:

- The app checks for updates 5 seconds after launch
- If an update is found, a notification card appears with the new version and release notes
- The user can choose "Update Now" to download and install, or "Later" to dismiss
- After installation, the app relaunches with the new version

The updater fetches `latest.json` from the latest GitHub Release to determine if a newer version is available.
