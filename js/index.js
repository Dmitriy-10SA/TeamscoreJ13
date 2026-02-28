document.addEventListener('DOMContentLoaded', () => {
    // Кнопки (без кнопки внутри модального окна)
    const openModalWindowButton = document.getElementById("open_modal_window_button");
    const closeModalWindowButton = document.getElementById("close_modal_window_button");

    // Модальное окно (а также кнопка и textarea)
    const modalWindow = document.getElementById("modal_window");
    const modalWindowUpperText = document.getElementById("modal_window_upper_text");
    const addTaskButton = document.getElementById("add_task_button");
    const taskTitleInModalTextarea = document.getElementById("task_title_in_modal_textarea");

    // Счетчики задач внутри колонок
    const doTaskCnt = document.getElementById("do_task_cnt");
    const inWorkTaskCnt = document.getElementById("in_work_task_cnt");
    const doneTaskCnt = document.getElementById("done_task_cnt");

    // Колонки с задачами (контейнеры для них)
    const doTaskContainer = document.getElementById("do_task_container");
    const inWorkTaskContainer = document.getElementById("in_work_task_container");
    const doneTaskContainer = document.getElementById("done_task_container");

    const STORAGE_TASKS_KEY = "tasks";
    const STORAGE_LAST_ID_KEY = "last_task_id";

    let tasks = loadTasksFromStorage();
    let lastTaskId = loadLastId();

    let taskBeingEdited = null;

    function loadTasksFromStorage() {
        return JSON.parse(localStorage.getItem(STORAGE_TASKS_KEY)) || [];
    }

    function saveTasksToStorage(tasks) {
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    }

    function loadLastId() {
        return Number(localStorage.getItem(STORAGE_LAST_ID_KEY)) || 0;
    }

    function saveLastId(id) {
        localStorage.setItem(STORAGE_LAST_ID_KEY, id);
    }

    function closeModalWindow() {
        modalWindow.style.display = "none";
    }

    // Инициализация всех действий с модальным окном
    function initModalWindow() {
        modalWindow.style.display = 'none';
        openModalWindowButton.onclick = () => {
            taskTitleInModalTextarea.value = "";
            modalWindowUpperText.textContent = "Добавить задачу";
            addTaskButton.textContent = "Добавить";
            modalWindow.style.display = "flex";
        }
        closeModalWindowButton.onclick = () => closeModalWindow();
        modalWindow.onclick = (e) => {
            if (e.target === modalWindow) {
                modalWindow.style.display = "none";
            }
        };
    }

    function updateCounter() {
        const count = doTaskContainer.querySelectorAll(".task_item").length;
        doTaskCnt.textContent = `${count} задач`;
    }

    function createTask(text, status = "do", id = null, saveToStorage = true) {
        const taskId = id ?? ++lastTaskId;
        saveLastId(lastTaskId);

        const taskItem = document.createElement("div");
        taskItem.className = "task_item";
        taskItem.dataset.id = taskId.toString();

        taskItem.innerHTML = `
        <div>
            <span>${text}</span>
            <div>
                <button class="edit">✏️</button>
                <button class="delete">🗑️</button>
            </div>
        </div>
    `;

        taskItem.querySelector(".edit").onclick = () => {
            taskBeingEdited = taskItem;
            taskTitleInModalTextarea.value = text;
            modalWindowUpperText.textContent = "Изменить задачу";
            addTaskButton.textContent = "Сохранить";
            modalWindow.style.display = "flex";
        };

        taskItem.querySelector(".delete").onclick = () => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasksToStorage(tasks);
            taskItem.remove();
            updateCounter();
        };

        doTaskContainer.appendChild(taskItem);

        // сохраняем в storage
        if (saveToStorage) {
            tasks.push({ id: taskId, title: text, status });
            saveTasksToStorage(tasks);
        }
    }

    addTaskButton.onclick = () => {
        const text = taskTitleInModalTextarea.value.trim();
        if (!text) {
            return;
        }
        if (taskBeingEdited) {
            const id = Number(taskBeingEdited.dataset.id);

            taskBeingEdited.querySelector("span").textContent = text;

            const task = tasks.find(t => t.id === id);
            if (task) {
                task.title = text;
                saveTasksToStorage(tasks);
            }
        } else {
            createTask(text);
        }
        closeModalWindow();
        updateCounter();
    };

    function renderTasksFromStorage() {
        tasks.forEach(task => {
            if (task.status === "do") {
                createTask(task.title, task.status, task.id, false);
            }
            // позже добавим in_work и done
        });

        updateCounter();
    }

    renderTasksFromStorage();

    initModalWindow();
});