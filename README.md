# Focus & Flow - To-Do + Focus App

A productivity app that combines task management with the Pomodoro Technique to help you focus on what matters most and build momentum through structured work sessions.

## ✨ Features

### Core Productivity Features
- **Task Management**: Create, edit, and organize tasks with priorities (P1-P3) and tags
- **Most Important Task (MIT)**: Daily focus on your most critical task with guided selection and celebration UI
- **Pomodoro Timer**: 25-minute focus sessions with automatic breaks (5min short, 15min long)
- **Audio & Visual Notifications**: Pleasant completion sounds and rich browser notifications when sessions end
- **Focus Mode**: Distraction-free environment for deep work with large timer display
- **Quick Focus**: Start pomodoro sessions without selecting a specific task for general work
- **Session Tracking**: Automatic logging of focus time per task with session notes

### Advanced Session Features
- **Subtasks**: Break down complex tasks into manageable sub-items with progress tracking
- **Session Notes**: Add reflections and insights during or after focus sessions
- **Adaptive Break Durations**: Break lengths automatically adjust based on user behavior patterns
- **Snooze/Extend Timer**: 30-120s guardrails to finish thoughts without derailing focus rhythm
- **Auto-Resume with Countdown**: 10s visual countdown before starting next session (optional)
- **Continue/Add Subtask Options**: Enhanced session completion flow with multiple options
- **Cancel Session**: Safe exit from focus sessions with progress preservation

### Analytics & Review
- **Daily Review**: Comprehensive auto-generated summary with metrics, focus score, and rollover planning
- **Session History**: View all completed focus sessions with notes and timestamps
- **Progress Dashboard**: Real-time stats on daily productivity and completed tasks
- **Focus Score**: Planned vs completed sessions ratio calculation

### User Experience
- **Light/Dark Theme System**: Complete theme support with light, dark, and system modes
  - Hover popup theme selector showing current mode icon with smooth dropdown
  - Three theme options (Light ☀️, Dark 🌙, System 💻) accessible on hover
  - Consistent styling across all components including Focus Mode
  - Optimized input field contrast and visibility in dark mode
  - Persistent theme preference storage
  - Automatic system preference detection
- **Enhanced Keyboard Shortcuts**: Full timer control via keyboard with visual shortcut reference
- **MIT Celebration**: Visual feedback when your Most Important Task is completed
- **Task Completion Tracking**: Toggle between active and completed tasks view
- **Offline-First**: Works without internet, all data stored locally in browser

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/claude-code-task-list.git
cd claude-code-task-list/claude
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Check TypeScript types
- `npm run lint` - Run ESLint

## 📖 How to Use

### 1. Add Your First Task
- Use the "Add a task..." input at the top
- Click "More" for detailed options (priority, tags, estimates, subtasks)

### 2. Set Your Most Important Task (MIT)
- Click the star icon next to any task to set as MIT
- Or use the guided MIT selection prompt that appears
- MIT gets special highlighting and celebration when completed

### 3. Start a Focus Session

**On a Specific Task:**
- Click the play button next to any task
- Enter Focus Mode with the timer and task details
- Break down tasks with subtasks during the session

**Quick Focus Session:**
- Use the "Quick Focus" button for general work or planning
- Perfect when you need to focus but don't have a specific task selected

### 4. Focus Session Features

**During a Session:**
- **Snooze**: Add 30s-2m to finish your current thought
- **Extend**: Add full minutes to the session
- **Notes**: Add session notes for reflection
- **Keyboard Shortcuts**: Control timer with Space, P, R, etc.

**Completing a Session:**
- **Complete**: Finish the session normally
- **Continue**: Start another pomodoro immediately on the same task
- **Add Subtask**: Break down the current task and continue
- **Mark Complete**: Check off the task when finishing

### 5. Track Your Progress
- **Daily Stats**: View focus minutes, sessions, completed tasks, MIT status
- **Daily Review**: Comprehensive summary with focus score and planning prompts
- **Session History**: Detailed timeline of all focus sessions with notes
- **Theme Selector**: Hover over theme icon (top-right corner) to switch between light/dark/system modes

## 🎯 Focus Workflow

1. **Plan**: Add tasks and select your MIT for the day
2. **Focus**: Start 25-minute focus sessions on specific tasks
3. **Break**: Take automatic 5-minute breaks between sessions (15min after 4 cycles)
4. **Adapt**: Use snooze/extend features when needed, add subtasks to break down work
5. **Review**: Check your daily progress and use insights for tomorrow's planning

## ⌨️ Keyboard Shortcuts

### General
- `Enter` in task input - Add new task
- `Esc` in Focus Mode - Exit to task list

### Timer Controls (Focus Mode)
- `Space` - Start/Pause timer
- `P` - Pause/Resume timer  
- `R` - Reset timer
- `S` - Stop timer
- `E` - Extend timer by 1 minute
- `Enter` - Complete session (when timer completed)
- `Esc` - Cancel menus/exit focus mode

## 🎨 Themes

The app supports three theme modes:
- **Light Mode**: Clean, bright interface for daytime use
- **Dark Mode**: Easy on the eyes for low-light environments  
- **System Mode**: Automatically follows your operating system's theme preference

Theme preferences are saved and persist across browser sessions.

## 🌐 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## 💾 Data Storage

All data is stored locally in your browser's localStorage. No data is sent to external servers. To backup your data, export your browser data or manually save the localStorage content.

Your data includes:
- All tasks and subtasks
- Session history and notes
- Daily progress statistics
- Theme preferences
- User settings

## 🛠️ Troubleshooting

**App won't load**: 
- Check browser console for errors
- Try clearing browser cache
- Ensure JavaScript is enabled

**Timer not working**:
- Check browser notification permissions (click "Allow" when prompted)
- Ensure tab remains active during sessions
- Try refreshing the page
- For sound issues, check browser audio permissions and volume settings

**Tasks not saving**:
- Check localStorage isn't full
- Try different browser or incognito mode
- Clear old browser data if needed

**Theme not switching**:
- Check if browser supports CSS custom properties
- Try hard refresh (Ctrl+F5 / Cmd+Shift+R)

**Input text hard to see in dark mode**:
- This has been fixed - all form inputs now have proper dark mode contrast
- If issues persist, try refreshing the page or clearing browser cache

## 🧰 Development

### Built with:
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with dark mode support
- **Vite** - Fast development and building
- **Lucide React** - Beautiful icons
- **Zustand** - State management

### Repository Structure
```
claude-code-task-list/
├── claude/                    # Main application directory
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── AutoResumeCountdown.tsx
│   │   │   ├── DailyReview.tsx
│   │   │   ├── FocusMode.tsx      # Main focus session UI
│   │   │   ├── PomodoroTimer.tsx  # Timer component
│   │   │   ├── SessionHistory.tsx
│   │   │   ├── SubtaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── ThemeToggle.tsx    # Theme switching
│   │   │   └── TodayView.tsx      # Main dashboard
│   │   ├── contexts/          # React contexts
│   │   │   └── ThemeContext.tsx   # Theme management
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useTimer.ts        # Timer logic
│   │   │   └── useTimerKeyboard.ts # Keyboard shortcuts
│   │   ├── stores/            # State management
│   │   │   └── useAppStore.ts     # Main app state
│   │   ├── types/             # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # App entry point
│   │   └── index.css          # Global styles
│   ├── package.json           # Dependencies and scripts
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── vite.config.ts         # Vite configuration
├── docs/                      # Documentation
│   └── PRODUCT_BRIEF.md       # Detailed product specification
└── README.md                  # This file
```

### Key Architecture Decisions
- **Local-first**: All data stored in browser localStorage
- **Offline-capable**: Full functionality without internet
- **Zustand for state**: Simple, powerful state management
- **Component composition**: Reusable, focused components
- **TypeScript throughout**: Full type safety
- **Tailwind + CSS custom properties**: Scalable theming system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (run `npm run typecheck` and `npm run build`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## 🎯 MVP Status: Complete ✅

This app has achieved all MVP goals and includes several enhanced features:

**Core MVP Features Completed:**
- ✅ Task CRUD with MIT selection
- ✅ Pomodoro timer with configurable cycles  
- ✅ Task-timer binding and session logging
- ✅ Focus Mode single-task UI
- ✅ Offline-first core functionality
- ✅ Daily progress tracking with comprehensive review

**Enhanced Features Beyond MVP:**
- ✅ Subtasks with progress tracking
- ✅ Adaptive break durations  
- ✅ Session notes & history
- ✅ MIT celebration states
- ✅ Complete theme system
- ✅ Enhanced keyboard shortcuts
- ✅ Auto-resume functionality

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for focused productivity and meaningful work.