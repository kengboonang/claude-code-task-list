# claude-code-task-list
A repo to explore claude code and creating a app for focusing on tasks

# Focus & Flow - To-Do + Focus App

A productivity app that combines task management with Pomodoro timer functionality to help you focus on what matters most and build momentum through structured work sessions.

## Features

- **Task Management**: Create, edit, and organize tasks with priorities and tags
- **Most Important Task (MIT)**: Daily focus on your most critical task with guided selection
- **Pomodoro Timer**: 25-minute focus sessions with automatic breaks (5min short, 15min long)
- **Focus Mode**: Distraction-free environment for deep work with large timer display
- **Session Tracking**: Automatic logging of focus time per task with session notes
- **Session History**: View all completed focus sessions with notes and timestamps
- **Progress Dashboard**: Real-time stats on daily productivity and completed tasks
- **Task Completion Tracking**: Toggle between active and completed tasks view
- **MIT Celebration**: Visual feedback when your Most Important Task is completed
- **Offline-First**: Works without internet, all data stored locally in browser

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone kengboonang/claude-code-task-list
cd claude
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
- `npm run lint` - Run ESLint (requires configuration)

## How to Use

### 1. Add Your First Task
- Use the "Add a task..." input at the top
- Click "More" for detailed options (priority, tags, estimates)

### 2. Set Your Most Important Task (MIT)
- Click the star icon next to any task to set as MIT
- Or use the guided MIT selection prompt

### 3. Start a Focus Session
- Click the play button next to any task
- Enter Focus Mode with the timer
- Work until the timer completes or manually stop
- Optionally check "Mark task as completed" when finishing
- Take the suggested break

### 4. Track Your Progress
- View daily stats: focus minutes, sessions, completed tasks, MIT status
- Click "Show Completed" to toggle between active and completed tasks
- Expand "Today's Sessions" to see session history with detailed notes
- Session history shows time ranges, duration, and any notes you added
- MIT displays celebration state when completed
- All progress is automatically saved locally
- Data persists between browser sessions

## Focus Workflow

1. **Plan**: Add tasks and select your MIT for the day
2. **Focus**: Start 25-minute focus sessions on specific tasks
3. **Break**: Take 5-minute breaks between sessions
4. **Repeat**: Build momentum with consistent focused work
5. **Review**: Check your daily progress and completed tasks

## Keyboard Shortcuts

- `Enter` in task input - Add new task
- `Esc` in Focus Mode - Exit to task list
- Click timer controls or use on-screen buttons

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Data Storage

All data is stored locally in your browser's localStorage. No data is sent to external servers. To backup your data, export your browser data or manually save the localStorage content.

## Troubleshooting

**App won't load**: 
- Check browser console for errors
- Try clearing browser cache
- Ensure JavaScript is enabled

**Timer not working**:
- Check browser notification permissions
- Ensure tab remains active during sessions

**Tasks not saving**:
- Check localStorage isn't full
- Try different browser or incognito mode

## Development

Built with:
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Project Structure
```
src/
  components/     # React components
  hooks/         # Custom React hooks
  stores/        # State management
  types/         # TypeScript interfaces
  utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
