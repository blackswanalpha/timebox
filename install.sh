#!/bin/bash

# TimeBox System Installer for Linux
# This script installs TimeBox to the system.

APP_NAME="TimeBox"
BINARY_NAME="timebox-main" # Matches package name in Cargo.toml
EXEC_NAME="timebox"
INSTALL_DIR="/usr/local/bin"
ICON_DIR="/usr/share/icons/hicolor/256x256/apps"
LAUNCHER_DIR="/usr/share/applications"

# Check for root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./install.sh)"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_BINARY="$PROJECT_DIR/src-tauri/target/release/$BINARY_NAME"
SOURCE_ICON="$PROJECT_DIR/src-tauri/icons/icon.png"

# Check if binary exists
if [ ! -f "$SOURCE_BINARY" ]; then
  echo "Error: Binary not found at $SOURCE_BINARY"
  echo "Please run ./scripts/build-installer.sh first."
  exit 1
fi

echo "Installing $APP_NAME..."

# 1. Install Binary
echo "Copying binary to $INSTALL_DIR/$EXEC_NAME..."
cp "$SOURCE_BINARY" "$INSTALL_DIR/$EXEC_NAME"
chmod +x "$INSTALL_DIR/$EXEC_NAME"

# 2. Install Icon
echo "Installing icon..."
# Install to hicolor theme
mkdir -p "$ICON_DIR"
cp "$SOURCE_ICON" "$ICON_DIR/timebox.png"
# Install to pixmaps (standard fallback)
mkdir -p "/usr/share/pixmaps"
cp "$SOURCE_ICON" "/usr/share/pixmaps/timebox.png"

# 3. Create Desktop Entry
echo "Creating desktop entry..."
cat > "$LAUNCHER_DIR/timebox.desktop" << EOL
[Desktop Entry]
Name=TimeBox
Comment=Productivity Pomodoro Timer & Task Manager
Exec=$INSTALL_DIR/$EXEC_NAME
Icon=timebox
Terminal=false
Type=Application
Categories=Utility;Office;
StartupWMClass=timebox-main
EOL

chmod +x "$LAUNCHER_DIR/timebox.desktop"

# 4. Update System Caches
echo "Updating system caches..."
update-desktop-database /usr/share/applications
gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true

# 5. Cleanup old developer launcher if it exists in the user's home
USER_DESKTOP="/home/$SUDO_USER/Desktop/TimeBox.desktop"
if [ -f "$USER_DESKTOP" ]; then
    echo "Removing legacy developer launcher from desktop..."
    rm "$USER_DESKTOP"
fi

echo "Installation complete!"
echo "You can now launch $APP_NAME from your application menu."
echo "Or run '$EXEC_NAME' from the terminal."
