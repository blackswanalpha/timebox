# TimeBox - Productivity Timer Application

<div align="center">
  <p>A sophisticated productivity application designed to enhance focus and efficiency through the implementation of the Pomodoro Technique.</p>
  
  [![License](https://img.shields.io/github/license/yourusername/timebox)](LICENSE)
  [![Version](https://img.shields.io/github/package-json/v/yourusername/timebox)](package.json)
  [![Tauri](https://img.shields.io/badge/Built%20with-Tauri-FFC131.svg)](https://tauri.app/)
</div>

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🌟 Overview

TimeBox is a modern productivity application built with Tauri, React, and TypeScript that implements the Pomodoro Technique to help users manage their time effectively and boost productivity. The application provides users with a comprehensive suite of tools to manage their time effectively, track their tasks, and analyze their productivity patterns.

Built using modern web technologies and wrapped in a native desktop shell via Tauri, TimeBox offers both the flexibility of web technologies and the performance of native applications. The app combines focused work sessions with scheduled breaks to maintain concentration and prevent burnout.

The primary purpose of TimeBox is to help individuals improve their productivity by structuring work into focused intervals separated by short breaks. This technique, known as the Pomodoro Technique, has been proven to enhance concentration, reduce mental fatigue, and improve task completion rates. TimeBox automates and streamlines this process, allowing users to focus on their work rather than managing timers and schedules manually.

## ✨ Features

### Core Functionality
- **Pomodoro Timer**: Customizable work and break intervals with visual countdown and circular progress indicator
- **Task Management System**: Create, organize, and track tasks with estimated Pomodoro counts
- **Session History**: Detailed logging of completed Pomodoro sessions with task associations
- **Analytics Dashboard**: Visual insights into productivity patterns and trends through charts and graphs
- **Settings Panel**: Extensive customization options for timer configurations and preferences

### User Experience
- **Dark/Light Theme**: System-adaptive UI with comfortable viewing options for any lighting condition
- **Responsive Design**: Adapts to different screen sizes and devices
- **Visual Feedback**: Progress indicators and animations for better user engagement
- **Notifications**: Elegant toast notifications for session transitions
- **Accessibility**: Designed with modern accessibility standards in mind

### Advanced Features
- **Interruption Tracking**: Records when users pause or stop sessions early for productivity analysis
- **Strict Mode**: Prevents skipping sessions or extending break times for disciplined users
- **Auto-start Breaks**: Configurable option to automatically begin break sessions after focus periods
- **Data Synchronization**: Local data storage ensuring privacy and reliability

## 🛠️ Technologies Used

### Frontend Stack
- **Frontend Framework**: [React 19](https://react.dev/) - Component-based architecture with modern features
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) - Static type checking for code reliability
- **UI Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [Lucide React](https://lucide.dev/) - Consistent, accessible icon library
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library
- **Date Handling**: [date-fns](https://date-fns.org/) - Modern date utility library

### Backend & Native Integration
- **Native Desktop**: [Tauri](https://tauri.app/) - Lightweight, secure native desktop applications
- **State Management**: [Jotai](https://jotai.org/) - Primitive and flexible state management for React
- **Build System**: [Vite](https://vitejs.dev/) - Fast development and build times with HMR
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) - Elegant toast notifications

### Development Dependencies
- **PostCSS**: For CSS processing and Tailwind integration
- **Type Definitions**: Comprehensive TypeScript support
- **Plugin System**: Tauri plugins for additional functionality

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Rust (for Tauri builds)

### Quick Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/timebox.git
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
npm run tauri build
```

### Alternative Installation Methods
- **Development Mode**: `npm run dev` - Starts the development server with hot reload
- **Production Build**: `npm run build` - Creates an optimized production build
- **Tauri Development**: `npm run tauri dev` - Runs the Tauri application in development mode
- **Tauri Production Build**: `npm run tauri build` - Creates a native desktop application

## 🎯 Usage

### Getting Started
1. **Initial Setup**: Launch the application and configure your timer preferences in the Settings tab
2. **Task Creation**: Navigate to the Tasks tab to create and organize your work items
3. **Start a Session**: Go to the Timer tab, select a task, and begin your first Pomodoro session

### Main Workflow
1. **Morning Planning**: Review tasks and estimate Pomodoro requirements in the Tasks tab
2. **Session Initiation**: Select a task and start a focus session using the Timer tab
3. **Work Period**: Focus on the selected task until the timer completes
4. **Break Time**: Take a short break as prompted by the application
5. **Repeat Cycle**: Continue the pattern throughout the workday
6. **Review Progress**: Check session history and analytics to assess productivity
7. **Adjust Strategy**: Modify settings or task estimates based on performance data

### Navigation Guide
- **Timer Tab**: Central hub for Pomodoro sessions with visual countdown
- **Tasks Tab**: Manage and organize your work items with Pomodoro estimates
- **History Tab**: Review past sessions and analyze your productivity patterns
- **Analytics Tab**: View charts and statistics about your work trends
- **Settings Tab**: Customize timer durations and app preferences

### Customization Options
- **Timer Durations**: Adjust focus (default 25 min), short break (5 min), and long break (15-30 min) lengths
- **Cycles Configuration**: Set how many focus sessions before a long break (default 4)
- **Strict Mode**: Enable features that prevent skipping sessions or taking extended breaks
- **Auto-start Options**: Configure whether breaks start automatically after focus sessions
- **Theme Preferences**: Toggle between light and dark themes
- **Notification Settings**: Customize alerts and reminders

## 🏗️ Architecture

### Component-Based Structure
The application follows a component-based architecture with:

- **Atoms**: Global state management using Jotai for efficient updates and synchronization
- **Components**: Reusable UI elements (Timer, Task Manager, Analytics Dashboard, etc.)
- **Hooks**: Custom hooks for timer logic, data persistence, and API interactions
- **Types**: Strongly typed interfaces for all data structures ensuring type safety

### State Management
TimeBox uses Jotai atoms for global state management, providing efficient updates and synchronization across components. The application maintains states for:
- Current timer status (running, paused, completed)
- Active session type (focus, short break, long break)
- Selected task and navigation state
- User settings and preferences
- Historical session data

### Timer Logic
The timer functionality is implemented in the `useTimer` custom hook, which manages:
- Time calculation and countdown logic
- Session transitions (focus → break → focus)
- Pause/resume functionality
- Completion detection and notifications
- Data persistence for session history

### Data Persistence
All application data is stored locally using Tauri's file system capabilities, ensuring data privacy and reliability while maintaining cross-platform compatibility.

## 📸 Screenshots

> [!NOTE]  
> Screenshots coming soon! Here's a preview of what you can expect from the TimeBox interface:
> 
> - Clean, minimalist design that reduces distractions
> - Circular progress indicator showing remaining time
> - Intuitive navigation between different application sections
> - Dark/light theme support for comfortable use
> - Detailed analytics dashboard with productivity insights
> - Task management interface with estimation tools

## 👥 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/timebox.git`
3. Navigate to the project directory: `cd timebox`
4. Install dependencies: `npm install`
5. Start developing: `npm run dev`

### Contribution Guidelines
1. **Feature Requests**: Open an issue to discuss new features before implementing
2. **Bug Reports**: Create an issue with detailed reproduction steps
3. **Pull Requests**: 
   - Create a feature branch (`git checkout -b feature/amazing-feature`)
   - Make your changes with clear, descriptive commit messages
   - Add tests if applicable
   - Update documentation as needed
   - Submit a pull request to the `main` branch

### Code Standards
- Follow the existing code style and patterns
- Write meaningful commit messages
- Add comments for complex logic
- Ensure TypeScript type safety
- Test your changes thoroughly

### Areas Needing Help
- UI/UX improvements and accessibility enhancements
- Additional analytics features
- Internationalization (i18n) support
- Performance optimizations
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

- **Documentation**: Check the [docs](./docs/) directory for detailed guides
- **Issues**: Report bugs or request features through the [GitHub Issues](https://github.com/yourusername/timebox/issues) page
- **Email**: Contact the maintainers at [your-email@example.com](mailto:your-email@example.com)
- **Discussions**: Join our community discussions for help and ideas

For security vulnerabilities, please contact us directly at [security@timebox.example.com](mailto:security@timebox.example.com) rather than creating a public issue.

---

<div align="center">
  <p>Made with ❤️ to boost your productivity</p>
  <p><em>TimeBox - Transform your time into focus</em></p>
</div>