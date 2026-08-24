// Todo List Application with Local Storage

class TodoApp {
    constructor() {
        this.tasks = this.loadFromStorage();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.render();
    }

    cacheElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.sortSelect = document.getElementById('sortSelect');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.resetBtn = document.getElementById('resetBtn');
        this.totalTasksDisplay = document.getElementById('totalTasks');
        this.activeTasksDisplay = document.getElementById('activeTasks');
        this.completedTasksDisplay = document.getElementById('completedTasks');
        this.completionPercentageDisplay = document.getElementById('completionPercentage');
    }

    attachEventListeners() {
        // Input events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.closest('.filter-btn').dataset.filter));
        });

        // Sort event
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Export/Import
        this.exportBtn.addEventListener('click', () => this.exportTasks());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importTasks(e));

        // Reset
        this.resetBtn.addEventListener('click', () => this.resetAll());
    }

    addTask() {
        const title = this.taskInput.value.trim();
        
        if (!title) {
            this.showNotification('Please enter a task', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            title: title,
            priority: this.prioritySelect.value,
            category: this.categorySelect.value,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null
        };

        this.tasks.unshift(task);
        this.saveToStorage();
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.categorySelect.value = 'work';
        this.render();
        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveToStorage();
            this.render();
            this.showNotification('Task deleted', 'success');
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        this.showEditModal(task);
    }

    showEditModal(task) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-edit"></i> Edit Task</h2>
                <input type="text" id="editTitle" value="${task.title}" placeholder="Task title">
                <select id="editPriority">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low Priority</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High Priority</option>
                </select>
                <select id="editCategory">
                    <option value="work" ${task.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>Personal</option>
                    <option value="shopping" ${task.category === 'shopping' ? 'selected' : ''}>Shopping</option>
                    <option value="health" ${task.category === 'health' ? 'selected' : ''}>Health</option>
                    <option value="other" ${task.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
                <div class="modal-buttons">
                    <button class="btn-save" onclick="todoApp.saveEditedTask()">Save</button>
                    <button class="btn-cancel" onclick="todoApp.closeEditModal()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('editTitle').focus();

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeEditModal();
        });

        document.getElementById('editTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEditedTask();
        });
    }

    saveEditedTask() {
        const title = document.getElementById('editTitle').value.trim();
        const priority = document.getElementById('editPriority').value;
        const category = document.getElementById('editCategory').value;

        if (!title) {
            this.showNotification('Task title cannot be empty', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.title = title;
            task.priority = priority;
            task.category = category;
            this.saveToStorage();
            this.closeEditModal();
            this.render();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    closeEditModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
        this.editingTaskId = null;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear', 'info');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
            this.showNotification('Completed tasks cleared', 'success');
        }
    }

    getFilteredTasks() {
        let filtered = this.tasks;

        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            default:
                break;
        }

        return filtered;
    }

    getSortedTasks(tasks) {
        const sorted = [...tasks];

        switch (this.currentSort) {
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'name':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date-desc':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return sorted;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    render() {
        const filtered = this.getFilteredTasks();
        const sorted = this.getSortedTasks(filtered);

        this.updateStats();

        if (sorted.length === 0) {
            this.tasksList.innerHTML = '';
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');
        this.tasksList.innerHTML = sorted.map(task => this.createTaskElement(task)).join('');

        // Attach event listeners to task elements
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(parseInt(e.target.dataset.taskId));
            });
        });

        document.querySelectorAll('.task-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTask(parseInt(e.target.closest('.task-btn').dataset.taskId));
            });
        });

        document.querySelectorAll('.task-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTask(parseInt(e.target.closest('.task-btn').dataset.taskId));
            });
        });
    }

    createTaskElement(task) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority">
                <div class="checkbox-wrapper">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        data-task-id="${task.id}"
                    >
                </div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="task-category ${task.category}">${task.category}</span>
                        <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                        <span class="task-date">${this.formatDate(task.createdAt)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit" data-task-id="${task.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete" data-task-id="${task.id}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        this.totalTasksDisplay.textContent = total;
        this.activeTasksDisplay.textContent = active;
        this.completedTasksDisplay.textContent = completed;
        this.completionPercentageDisplay.textContent = percentage + '%';
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                if (!Array.isArray(imported)) {
                    throw new Error('Invalid format: Expected an array of tasks');
                }

                // Validate tasks structure
                const validTasks = imported.filter(task => 
                    task.id && task.title && task.priority && task.category
                );

                if (validTasks.length === 0) {
                    throw new Error('No valid tasks found in file');
                }

                if (confirm(`Import ${validTasks.length} task(s)? This will add to your existing tasks.`)) {
                    this.tasks = [...validTasks, ...this.tasks];
                    this.saveToStorage();
                    this.render();
                    this.showNotification(`${validTasks.length} tasks imported successfully!`, 'success');
                }
            } catch (error) {
                this.showNotification(`Import failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    resetAll() {
        if (confirm('This will delete ALL tasks. Are you sure? This cannot be undone.')) {
            this.tasks = [];
            this.saveToStorage();
            this.render();
            this.showNotification('All tasks have been cleared', 'success');
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('todoAppTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving tasks', 'error');
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('todoAppTasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#667eea'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);