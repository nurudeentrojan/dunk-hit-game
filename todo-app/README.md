# Todo List Application

A beautiful, fully-featured todo list application with local storage functionality. Organize your tasks efficiently with categories, priorities, and powerful filtering options.

## Features

✨ **Core Functionality**
- ✅ Add, edit, and delete tasks
- ✓ Mark tasks as complete/incomplete
- 📊 Real-time progress tracking
- 💾 Automatic local storage persistence

📋 **Task Organization**
- 🏷️ Categorize tasks (Work, Personal, Shopping, Health, Other)
- 🎯 Set priority levels (Low, Medium, High)
- 🔄 Multiple sorting options (Date, Priority, Alphabetical)
- 🔍 Filter by status (All, Active, Completed)

📈 **Statistics & Analytics**
- Total tasks count
- Active tasks counter
- Completed tasks tracker
- Progress percentage

💾 **Data Management**
- 📥 Export tasks to JSON file
- 📤 Import tasks from JSON file
- 🔄 Seamless data persistence
- 🗑️ Clear all data option

🎨 **User Experience**
- Beautiful gradient design
- Smooth animations and transitions
- Responsive mobile-friendly interface
- Real-time notifications
- Intuitive controls

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nurudeentrojan/dunk-hit-game.git
cd dunk-hit-game/todo-app
```

2. Open in your browser:
```bash
open index.html
# or
start index.html
```

## How to Use

### Adding Tasks
1. Enter task text in the input field
2. Select priority level (Low, Medium, High)
3. Select category (Work, Personal, Shopping, Health, Other)
4. Click "Add" or press Enter

### Managing Tasks
- **Complete**: Click the checkbox next to a task
- **Edit**: Click the edit button to modify task details
- **Delete**: Click the delete button to remove a task

### Filtering Tasks
- Click "All" to see all tasks
- Click "Active" to see incomplete tasks only
- Click "Completed" to see finished tasks

### Sorting Tasks
- **Newest First**: Most recently added tasks appear first
- **Oldest First**: Oldest tasks appear first
- **Priority**: Sort by importance level
- **Alphabetical**: Sort by task name

### Data Management
- **Export**: Download all tasks as a JSON file
- **Import**: Load tasks from a previously exported file
- **Clear Completed**: Remove all finished tasks
- **Reset All**: Delete all tasks permanently

## Local Storage

The application automatically saves your tasks to the browser's local storage. Your data persists even after closing the browser.

**Storage Details:**
- Key: `todoAppTasks`
- Format: JSON array
- Size: Depends on number of tasks

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Task | Enter (in input field) |
| Save Edit | Enter (in edit modal) |
| ESC | Close edit modal |

## Task Structure

Each task contains:
```json
{
  "id": 1234567890,
  "title": "Task description",
  "priority": "medium",
  "category": "work",
  "completed": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "dueDate": null
}
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No dependencies required
- **Local Storage API** - Data persistence
- **Font Awesome** - Icons

## Tips & Tricks

💡 **Pro Tips:**
- Use High Priority for urgent tasks
- Organize by categories to group similar tasks
- Export your tasks regularly as backup
- Use the progress percentage to stay motivated
- Sort by priority when you have many tasks

## Roadmap

🔮 **Future Enhancements:**
- Due date picker with reminders
- Recurring tasks
- Task tags and custom categories
- Dark mode
- Cloud synchronization
- Multiple projects/lists
- Task notes and descriptions
- Drag and drop reordering

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.

---

**Made with ❤️ for productivity enthusiasts!**