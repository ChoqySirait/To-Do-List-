const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
let currentFilter = 'all';

function getTasks() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskText(oldText, newText) {
    const tasks = getTasks();
    const updatedTasks = tasks.map(task => {
        if (task.text === oldText) {
            return { ...task, text: newText.trim() };
        }
        return task;
    });
    saveTasks(updatedTasks);
    renderTasks();
}

function createTaskElement(taskText, isCompleted) {
    const listItem = document.createElement('li');
    listItem.classList.add('task-item');
    if (isCompleted) {
        listItem.classList.add('completed');
    }

    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;
    
    if (!isCompleted) {
        taskSpan.addEventListener('dblclick', function() {
            const inputEdit = document.createElement('input');
            inputEdit.type = 'text';
            inputEdit.value = taskText;
            inputEdit.classList.add('task-edit-input');
            
            listItem.replaceChild(inputEdit, taskSpan);
            inputEdit.focus();

            const handleUpdate = () => {
                const newText = inputEdit.value;
                if (newText.trim() && newText !== taskText) {
                    updateTaskText(taskText, newText);
                } else {
                    listItem.replaceChild(taskSpan, inputEdit);
                }
            };

            inputEdit.addEventListener('blur', handleUpdate);
            inputEdit.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleUpdate();
                }
            });
        });
    }

    const actionGroup = document.createElement('div');
    actionGroup.classList.add('action-group');
    
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('toggle-btn');
    
    toggleBtn.innerHTML = isCompleted 
        ? '<i class="fa-solid fa-check"></i>'
        : '<i class="fa-regular fa-circle"></i>';

    toggleBtn.addEventListener('click', function() {
        toggleComplete(taskText);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>'; 
    deleteBtn.setAttribute('aria-label', `Hapus tugas: ${taskText}`);
    
    deleteBtn.addEventListener('click', function() {
        deleteTask(taskText, listItem); 
    });

    actionGroup.appendChild(toggleBtn);
    actionGroup.appendChild(deleteBtn);

    listItem.appendChild(taskSpan);
    listItem.appendChild(actionGroup);
    
    return listItem;
}

function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();
}

function renderTasks() {
    todoList.innerHTML = '';
    const tasks = getTasks();
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') {
            return !task.completed;
        } else if (currentFilter === 'completed') {
            return task.completed;
        }
        return true;
    });
    
    filteredTasks.forEach(task => {
        const item = createTaskElement(task.text, task.completed);
        todoList.appendChild(item);
    });

    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('Tugas tidak boleh kosong!');
        return;
    }

    const tasks = getTasks();
    
    if (tasks.some(task => task.text.toLowerCase() === text.toLowerCase())) {
        alert('Tugas ini sudah ada dalam daftar!');
        return;
    }
    
    tasks.push({ text: text, completed: false });
    saveTasks(tasks);
    taskInput.value = '';
    renderTasks();
}

function toggleComplete(taskText) {
    const tasks = getTasks();
    const updatedTasks = tasks.map(task => {
        if (task.text === taskText) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks(updatedTasks);
    
    if (currentFilter !== 'all') {
        renderTasks(); 
    } else {
        renderTasks();
    }
}

function deleteTask(taskText, listItem) {
    listItem.classList.add('fade-out');
    
    setTimeout(() => {
        const tasks = getTasks().filter(task => task.text !== taskText);
        saveTasks(tasks);
        
        renderTasks();
    }, 400);
}

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterTasks(this.dataset.filter);
    });
});

document.addEventListener('DOMContentLoaded', renderTasks);