# TimeBox OTA & CI/CD Release Guide

This document covers the full setup for over-the-air (OTA) updates and the GitHub Actions CI/CD pipeline used to build, sign, and publish TimeBox releases.

---

## Architecture Overview

```
Tag push (v*) → GitHub Actions → Build (Linux/macOS/Windows) → Sign artifacts → Publish Release → latest.json
                                                                                                      ↑
                                                                              Running app checks this endpoint
```

- **Trigger**: Pushing a `v*` tag (e.g. `v0.2.0`) starts the pipeline
- **Build**: Cross-platform matrix builds produce `.deb`, `.rpm`, `.AppImage`, `.dmg`, `.msi`, `.exe`
- **Sign**: Each updater artifact is signed with an Ed25519 keypair
- **Publish**: Artifacts are uploaded to a GitHub Release with a `latest.json` manifest
- **OTA**: Running TimeBox instances fetch `latest.json` to detect and install updates

---

## 1. Signing Keypair Setup

The updater uses Ed25519 signatures to verify update integrity. You need a keypair before releasing.

### Generate the keypair

```bash
cd timebox-main
npx tauri signer generate -w ~/.tauri/timebox.key
```

You'll be prompted for a password twice. **Remember this password** — you'll need it for GitHub secrets.

This creates:
- `~/.tauri/timebox.key` — private key (keep secret, never commit)
- `~/.tauri/timebox.key.pub` — public key

### Configure the public key

The public key goes in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`:

```json
"plugins": {
  "updater": {
    "pubkey": "<contents of ~/.tauri/timebox.key.pub>",
    "endpoints": [
      "https://github.com/blackswanalpha/timebox/releases/latest/download/latest.json"
    ]
  }
}
```

### Key file format

The private key file is a single base64-encoded string. Example:

```
dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWN...
```

**Important**: The key must be a single line with no newlines or spaces. The CI workflow strips whitespace automatically, but verify this if you encounter signing errors.

---

## 2. GitHub Secrets

Go to **Settings > Secrets and variables > Actions** in your GitHub repo. Add two repository secrets:

| Secret | Value | Notes |
|---|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | Contents of `~/.tauri/timebox.key` | Single base64 string, no line breaks |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | The password from key generation | Must be non-empty (GitHub rejects empty secrets) |

### Verifying the key locally

Test that the key works before pushing to CI:

```bash
TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/timebox.key)" \
TAURI_SIGNING_PRIVATE_KEY_PASSWORD="yourpassword" \
npm run tauri build
```

If the build ends with `Finished N updater signatures`, the key is correct.

---

## 3. CI/CD Pipeline

The workflow lives at `.github/workflows/release.yml` and has three jobs:

### Job 1: `create-release`

Creates a **draft** GitHub Release tagged with the version.

### Job 2: `build-tauri`

Runs a matrix build across 4 targets:

| Runner | Target | Outputs |
|---|---|---|
| `ubuntu-22.04` | Linux x86_64 | `.deb`, `.rpm`, `.AppImage` |
| `macos-latest` | Apple Silicon | `.dmg`, `.app` |
| `macos-latest` | Intel Mac (`x86_64-apple-darwin`) | `.dmg`, `.app` |
| `windows-latest` | Windows x86_64 | `.msi`, `.exe` |

Each build:
1. Checks out the repo
2. Installs system dependencies (Linux only: `libwebkit2gtk-4.1-dev`, `patchelf`, etc.)
3. Sets up Node.js and Rust
4. Runs `npm ci`
5. Sanitizes the signing key (strips any whitespace/newlines injected by GitHub)
6. Builds via `tauri-apps/tauri-action@v0`
7. Signs updater artifacts
8. Uploads bundles + `latest.json` to the draft release

### Job 3: `publish-release`

After all builds succeed, marks the draft release as **published**.

---

## 4. Tauri Configuration

### `src-tauri/tauri.conf.json`

Key settings for OTA:

```json
{
  "bundle": {
    "createUpdaterArtifacts": "v1Compatible"
  },
  "plugins": {
    "updater": {
      "pubkey": "<your public key>",
      "endpoints": [
        "https://github.com/<owner>/<repo>/releases/latest/download/latest.json"
      ]
    }
  }
}
```

- `createUpdaterArtifacts: "v1Compatible"` — generates both v1 and v2 update formats
- `endpoints` — where the app checks for `latest.json`

### `src-tauri/capabilities/default.json`

Required permissions:

```json
"permissions": [
  "updater:default",
  "updater:allow-check",
  "updater:allow-download-and-install",
  "process:allow-restart"
]
```

### `src-tauri/src/lib.rs`

Register the plugins before `.setup()`:

```rust
.plugin(tauri_plugin_updater::Builder::new().build())
.plugin(tauri_plugin_process::init())
```

### CSP (Content Security Policy)

The `connect-src` directive must allow GitHub:

```
connect-src 'self' https://github.com https://objects.githubusercontent.com
```

---

## 5. Frontend Update Flow

### `useUpdater.ts` hook

Manages the update lifecycle:

- **Auto-check**: Checks for updates 5 seconds after app launch
- **States**: `idle` → `checking` → `available` → `downloading` → `installing`
- **Progress**: Tracks download percentage (0–100)
- **Error handling**: Silently ignores "no release found" errors (404, network issues)
- **Install**: Downloads, installs, and relaunches the app

### `UpdateNotification.tsx` component

A floating notification card that:

- Appears when an update is available
- Shows the new version number and release notes
- Displays a download progress bar
- Provides "Update Now", "Later", and "Retry" buttons

---

## 6. Releasing a New Version

### Step-by-step

1. **Bump the version** in three files (all must match):

```bash
# package.json
"version": "0.2.0"

# src-tauri/tauri.conf.json
"version": "0.2.0"

# src-tauri/Cargo.toml
version = "0.2.0"
```

2. **Commit and tag**:

```bash
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "Bump version to v0.2.0"
git tag v0.2.0
git push origin main --tags
```

3. **Monitor the build**: Go to `https://github.com/blackswanalpha/timebox/actions`

4. **Verify the release**: Check `https://github.com/blackswanalpha/timebox/releases`

The release should contain:
- Platform-specific installers (`.deb`, `.rpm`, `.AppImage`, `.dmg`, `.msi`, `.exe`)
- Updater archives (`.tar.gz`, `.zip`) with `.sig` signature files
- `latest.json` — the update manifest

### What `latest.json` looks like

```json
{
  "version": "0.2.0",
  "notes": "Release notes from the GitHub Release body",
  "pub_date": "2026-03-13T12:00:00Z",
  "platforms": {
    "linux-x86_64": {
      "url": "https://github.com/.../TimeBox_0.2.0_amd64.AppImage.tar.gz",
      "signature": "dW50cnVzdGVkIGNvbW1..."
    },
    "darwin-aarch64": { ... },
    "darwin-x86_64": { ... },
    "windows-x86_64": { ... }
  }
}
```

---

## 7. How OTA Updates Work (End-User Perspective)

1. User launches TimeBox
2. After 5 seconds, the app fetches `latest.json` from the latest GitHub Release
3. If a newer version exists, a notification card slides in
4. User clicks "Update Now"
5. The app downloads the update with a progress bar
6. After download, the update is installed and the app relaunches

If no release exists or the network is unavailable, the check silently skips with no error shown.

---

## 8. Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `failed to decode secret key: Invalid symbol 10` | Newline in `TAURI_SIGNING_PRIVATE_KEY` secret | Re-paste the key as a single line, no line breaks |
| `failed to decode secret key: Invalid symbol 32` | Space in the signing key | Remove any spaces from the secret value |
| `A public key has been found, but no private key` | `TAURI_SIGNING_PRIVATE_KEY` secret not set | Add the secret in GitHub repo settings |
| `data did not match any variant of untagged enum Updater` | Invalid `createUpdaterArtifacts` value | Use `"v1Compatible"` or `true`, not `"v2Compatible"` |
| `Could not fetch a valid release JSON` | No release published yet | Expected on first run — the app silently handles this |
| Version mismatch error in build | npm and Cargo crate versions differ | Run `cargo update` to sync Rust crate versions |
| macOS build fails | Missing Rust target | Ensure `aarch64-apple-darwin,x86_64-apple-darwin` targets in workflow |
| Linux build fails | Missing system libraries | Check that `libwebkit2gtk-4.1-dev`, `patchelf`, etc. are installed |

---

## 9. Dependencies

### npm (frontend)

```
@tauri-apps/plugin-updater
@tauri-apps/plugin-process
```

### Cargo (Rust backend)

```toml
tauri-plugin-updater = "2"
tauri-plugin-process = "2"
```

### Workflow actions

```
actions/checkout@v4
actions/create-release@v1
actions/setup-node@v4
dtolnay/rust-toolchain@stable
swatinem/rust-cache@v2
tauri-apps/tauri-action@v0
actions/github-script@v7
```
