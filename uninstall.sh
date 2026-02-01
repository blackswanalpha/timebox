#!/bin/bash

# TimeBox Uninstaller
# This script removes TimeBox from the system.

APP_NAME="TimeBox"
EXEC_NAME="timebox"
INSTALL_DIR="/usr/local/bin"
ICON_PATH="/usr/share/icons/hicolor/256x256/apps/timebox.png"
LAUNCHER_PATH="/usr/share/applications/timebox.desktop"

# Check for root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./uninstall.sh)"
  exit 1
fi

echo "Uninstalling $APP_NAME..."

# Remove Binary
if [ -f "$INSTALL_DIR/$EXEC_NAME" ]; then
    echo "Removing binary..."
    rm "$INSTALL_DIR/$EXEC_NAME"
fi

# Remove Icon
if [ -f "$ICON_PATH" ]; then
    echo "Removing icon..."
    rm "$ICON_PATH"
fi

# Remove Desktop Entry
if [ -f "$LAUNCHER_PATH" ]; then
    echo "Removing desktop entry..."
    rm "$LAUNCHER_PATH"
fi

echo "$APP_NAME has been successfully uninstalled."
