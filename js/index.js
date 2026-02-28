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

    let taskBeingEdited = null;

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

    function createTask(text) {
        const taskItem = document.createElement("div");
        taskItem.className = "task_item";

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
            taskTitleInModalTextarea.value = taskItem.querySelector("span").textContent;
            modalWindowUpperText.textContent = "Изменить задачу";
            addTaskButton.textContent = "Сохранить";
            modalWindow.style.display = "flex";
        };
        taskItem.querySelector(".delete").onclick = () => {
            taskItem.remove();
            updateCounter();
        };
        doTaskContainer.appendChild(taskItem);
    }

    addTaskButton.onclick = () => {
        const text = taskTitleInModalTextarea.value.trim();
        if (!text) {
            return;
        }
        if (taskBeingEdited) {
            taskBeingEdited.querySelector("span").textContent = text;
        } else {
            createTask(text);
        }
        closeModalWindow();
        updateCounter();
    };

    initModalWindow();
});