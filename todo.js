const cover = document.getElementById("cover");
const pagesContainer = document.getElementById("pagesContainer");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

let currentPageIndex = 0;
const pageHeight = 700; 
const lineHeight = 30;  
const tasksPerPage = Math.floor(pageHeight / lineHeight) - 6; 
let allTasks = [];

/* COVER FLIP */
cover.addEventListener("click", () => {
    cover.classList.add("open");
    if (!pagesContainer.children.length) createPage();
});

/* ADD TASK INPUT */
function createPage() {
    const page = document.createElement("div");
    page.className = "page";

    page.innerHTML = `
    <h3 class="text-center mb-4">Todo List</h3>
    <div class="input-group mb-3">
        <input type="text" class="form-control task-input" placeholder="Add new task">
        <button class="btn btn-primary add-btn">Add</button>
    </div>
    <ul class="list-group task-list"></ul>
    `;

    pagesContainer.appendChild(page);
    showPage(currentPageIndex);

    // Add event listeners for inputs on this page
    const addBtn = page.querySelector(".add-btn");
    const taskInput = page.querySelector(".task-input");

    addBtn.addEventListener("click", () => addTask(taskInput));
    taskInput.addEventListener("keypress", e => {
        if (e.key === "Enter") addTask(taskInput);
    });
}

function addTask(input) {
    const task = input.value.trim();
    if (!task) return;

    allTasks.push(task);
    input.value = "";
    renderPages();
}

/* RENDER PAGES */
function renderPages() {
    // Remove all pages
    pagesContainer.innerHTML = "";
    const totalPages = Math.ceil(allTasks.length / tasksPerPage);

    for (let i = 0; i < totalPages; i++) {
        createPage();
        const page = pagesContainer.children[i];
        const taskList = page.querySelector(".task-list");

        const start = i * tasksPerPage;
        const end = start + tasksPerPage;
        allTasks.slice(start, end).forEach(taskText => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `
                <input type="checkbox" class="form-check-input">
                <span class="task-text">${taskText}</span>
                <button class="delete-btn">✖</button>
            `;
            taskList.appendChild(li);

            // Complete task
            const checkbox = li.querySelector("input");
            const text = li.querySelector(".task-text");
            checkbox.addEventListener("change", () => text.classList.toggle("completed"));

            // Delete task
            const deleteBtn = li.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                li.classList.add("fade-out");
                setTimeout(() => {
                    allTasks = allTasks.filter(t => t !== taskText);
                    renderPages();
                }, 300);
            });
        });
    }

    showPage(currentPageIndex);
}

/* PAGE NAVIGATION */
function showPage(index) {
    Array.from(pagesContainer.children).forEach((p, i) => {
        p.style.transform = `translateX(${(i - index) * 100}%)`;
        p.style.opacity = i === index ? 1 : 0;
    });

    prevPageBtn.disabled = index === 0;
    nextPageBtn.disabled = index === pagesContainer.children.length - 1;
}

prevPageBtn.addEventListener("click", () => {
    if (currentPageIndex > 0) currentPageIndex--;
    showPage(currentPageIndex);
    flipPage();
});

nextPageBtn.addEventListener("click", () => {
    if (currentPageIndex < pagesContainer.children.length - 1) currentPageIndex++;
    showPage(currentPageIndex);
    flipPage();
});

centerPageBtn.addEventListener("click", () => {
    currentPage = Math.floor(Math.ceil(allTasks.length / tasksPerPage)/2);
    flipPage();
});

function flipPage() {
    Array.from(pagesContainer.children).forEach((page, i) => {
        page.style.transform = `rotateY(${i < currentPage ? -180 : 0}deg)`;
        page.style.zIndex = pagesContainer.children.length - i;
    });
    updateNavButtons(pagesContainer.children.length);
}