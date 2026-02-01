#!/bin/bash
PROJECT_DIR="/home/mbugua/Desktop/project/timebox/timebox-main"
ICON_PATH="$PROJECT_DIR/src-tauri/icons/icon.png"
DESKTOP_FILE="/home/mbugua/Desktop/TimeBox.desktop"

cat > "$DESKTOP_FILE" << EOL
[Desktop Entry]
Name=TimeBox
Comment=Productivity Pomodoro Timer & Task Manager
Exec=bash -c "cd $PROJECT_DIR && npm run tauri dev"
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=Utility;Productivity;
EOL

chmod +x "$DESKTOP_FILE"
echo "Desktop launcher created at $DESKTOP_FILE"
