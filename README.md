# TimeBox - Productivity Timer Application

TimeBox is a modern productivity application built with Tauri, React, and TypeScript that implements the Pomodoro Technique to help users manage their time effectively and boost productivity. The app combines focused work sessions with scheduled breaks to maintain concentration and prevent burnout.

## Features

- **Pomodoro Timer**: Customizable work and break intervals with visual countdown
- **Task Management**: Create, organize, and track tasks with estimated Pomodoro counts
- **Session History**: Detailed logging of completed Pomodoro sessions
- **Analytics Dashboard**: Visual insights into productivity patterns and trends
- **Settings Panel**: Personalized timer configurations and preferences
- **Dark/Light Theme**: System-adaptive UI with comfortable viewing options
- **Cross-platform**: Native desktop application using Tauri framework

## Technologies Used

- **Frontend**: React 19, TypeScript
- **Framework**: Tauri (for native desktop app)
- **State Management**: Jotai atoms
- **UI Components**: Custom CSS with Lucide React icons
- **Build Tool**: Vite
- **Notifications**: Sonner toast notifications

## Installation

1. Clone the repository:
```bash
git clone https://github.com/username/timebox.git
cd timebox
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. To build for production:
```bash
npm run build
```

## Usage

1. **Timer Tab**: Start, pause, and manage your Pomodoro sessions
2. **Tasks Tab**: Create and manage tasks with Pomodoro estimates
3. **History Tab**: Review past sessions and analyze your productivity
4. **Analytics Tab**: View charts and statistics about your work patterns
5. **Settings Tab**: Customize timer durations and app preferences

## Architecture

The application follows a component-based architecture with:

- **Atoms**: Global state management using Jotai
- **Components**: Reusable UI elements (Timer, Task Manager, etc.)
- **Hooks**: Custom hooks for timer logic and API interactions
- **Types**: Strongly typed interfaces for all data structures

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.