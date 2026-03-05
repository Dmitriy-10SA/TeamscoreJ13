document.addEventListener('DOMContentLoaded', () => {
    // Кнопки для открытия и закрытия модального окна
    const openModalWindowButton = document.getElementById("open_modal_window_button");
    const closeModalWindowButton = document.getElementById("close_modal_window_button");

    // Кнопка для добавления/изменения задачи
    const addTaskButton = document.getElementById("add_task_button");

    // Модальное окно, верхний текст внутри модального окна и title задачи (также внутри модального окна)
    const modalWindow = document.getElementById("modal_window");
    const modalWindowUpperText = document.getElementById("modal_window_upper_text");
    const taskTitleInModalTextarea = document.getElementById("task_title_in_modal_textarea");

    // Колонки с задачами и контейнеры для них
    const doTaskColumn = document.getElementById("do_task_column");
    const doTaskContainer = document.getElementById("do_task_container");
    const inWorkTaskColumn = document.getElementById("in_work_task_column");
    const inWorkTaskContainer = document.getElementById("in_work_task_container");
    const doneTaskColumn = document.getElementById("done_task_column");
    const doneTaskContainer = document.getElementById("done_task_container");

    // Счетчики задач внутри колонок
    const doTaskCnt = document.getElementById("do_task_cnt");
    const inWorkTaskCnt = document.getElementById("in_work_task_cnt");
    const doneTaskCnt = document.getElementById("done_task_cnt");

    // Ключи в LocalStorage (для хранения задач и последнего id)
    const STORAGE_TASKS_KEY = "tasks";
    const STORAGE_LAST_ID_KEY = "last_task_id";

    // Задачи и последний id
    let tasks = loadTasksFromStorage();
    let lastTaskId = loadLastId();

    // Задача для изменения и задача для Drag-and-Drop
    let taskBeingEdited = null;
    let draggedTaskItem = null;

    // Инициализация DragZone
    function initDragZone(container, status) {
        container.addEventListener("dragover", (e) => e.preventDefault());
        container.addEventListener("drop", () => {
            if (!draggedTaskItem) return;
            const taskContainer = container.querySelector(".task_container");
            taskContainer.appendChild(draggedTaskItem);
            const id = Number(draggedTaskItem.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.status = status;
            }
            updateAllCounters();
        });
    }

    // Получение задач из LocalStorage
    function loadTasksFromStorage() {
        return JSON.parse(localStorage.getItem(STORAGE_TASKS_KEY)) || [];
    }

    // Сохранение задач в LocalStorage
    function saveTasksToStorage(tasks) {
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    }

    // Получение последнего id из LocalStorage
    function loadLastId() {
        return Number(localStorage.getItem(STORAGE_LAST_ID_KEY)) || 0;
    }

    // Сохранение последнего id в LocalStorage
    function saveLastId(id) {
        localStorage.setItem(STORAGE_LAST_ID_KEY, id);
    }

    // Закрытие модального окна
    function closeModalWindow() {
        modalWindow.style.display = "none";
        taskBeingEdited = null;
    }

    // Инициализация модального окна и всех действий с модальным окном
    function initModalWindowAndActions() {
        modalWindow.style.display = 'none';
        openModalWindowButton.onclick = () => {
            taskTitleInModalTextarea.value = "";
            modalWindowUpperText.textContent = "Добавить задачу";
            addTaskButton.textContent = "Добавить";
            taskBeingEdited = null;
            modalWindow.style.display = "flex";
        }
        closeModalWindowButton.onclick = () => closeModalWindow();
        modalWindow.onclick = (e) => {
            if (e.target === modalWindow) {
                closeModalWindow();
            }
        };
    }

    // обработка нажатий Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalWindow.style.display === "flex") {
            closeModalWindow();
        }
    });

    // Функция для правильного склонения слова "задача"
    function declOfNum(number, titles) {
        let cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    // Обновление всех счетчиков задач (во всех колонках)
    function updateAllCounters() {
        const doCount = doTaskContainer.querySelectorAll(".task_item").length;
        const inWorkCount = inWorkTaskContainer.querySelectorAll(".task_item").length;
        const doneCount = doneTaskContainer.querySelectorAll(".task_item").length;
        doTaskCnt.textContent = `${doCount} ${declOfNum(doCount, ['задача', 'задачи', 'задач'])}`;
        inWorkTaskCnt.textContent = `${inWorkCount} ${declOfNum(inWorkCount, ['задача', 'задачи', 'задач'])}`;
        doneTaskCnt.textContent = `${doneCount} ${declOfNum(doneCount, ['задача', 'задачи', 'задач'])}`;
    }

    // Добавление или изменение задачи
    function createOrEditTask(text, status = "do", id = null, saveToStorage = true) {
        const taskId = id ?? ++lastTaskId;
        const taskItem = document.createElement("div");
        taskItem.draggable = true;
        taskItem.addEventListener("dragstart", () => {
            draggedTaskItem = taskItem;
            taskItem.classList.add("dragging");
        });
        taskItem.addEventListener("dragend", () => {
            draggedTaskItem = null;
            taskItem.classList.remove("dragging");
        });
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
            taskItem.remove();
            updateAllCounters();
        };
        const container = status === "do" ? doTaskContainer :
            status === "in_work" ? inWorkTaskContainer : doneTaskContainer;
        container.appendChild(taskItem);
        if (saveToStorage) {
            tasks.push({id: taskId, title: text, status});
        }
        taskBeingEdited = null;
    }

    // Рендеринг задач из LocalStorage
    function renderTasksFromStorage() {
        tasks.forEach(task => {
            if (task.status === "do") {
                createOrEditTask(task.title, task.status, task.id, false);
            }
            if (task.status === "in_work") {
                createOrEditTask(task.title, task.status, task.id, false);
            }
            if (task.status === "done") {
                createOrEditTask(task.title, task.status, task.id, false);
            }
        });
        updateAllCounters();
    }

    // Действие по клику на кнопку добавления задачи в модальном окне
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
            }
            taskBeingEdited = null;
        } else {
            createOrEditTask(text);
        }
        closeModalWindow();
        updateAllCounters();
    };

    // Сохраняем задачи и последний id перед закрытием в LocalStorage
    window.addEventListener("beforeunload", () => {
        saveTasksToStorage(tasks);
        saveLastId(lastTaskId);
    });

    // Инициализация задач и модального окна
    renderTasksFromStorage();
    initModalWindowAndActions();

    // Инициализация DragZone
    initDragZone(doTaskColumn, "do");
    initDragZone(inWorkTaskColumn, "in_work");
    initDragZone(doneTaskColumn, "done");
});