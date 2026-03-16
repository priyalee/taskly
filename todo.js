const cover = document.getElementById("cover");
const pagesContainer = document.getElementById("pagesContainer");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const notebook = document.querySelector(".notebook");
const centerPageBtn = document.getElementById("centerPage");

let currentPageIndex = 0;
let allTasks = [];
let showAllPages = false;

function getTasksPerPage() {
  const pageHeight = notebook.offsetHeight;
  const lineHeight = 30;
  const padding = 60;
  return Math.floor(pageHeight / lineHeight) - Math.floor(padding / lineHeight);
}

let tasksPerPage = getTasksPerPage();

/* RESIZE */
window.addEventListener("resize", () => {
  tasksPerPage = getTasksPerPage();
  renderPages();
});

/* COVER OPEN */
cover.addEventListener("click", () => {
  cover.classList.add("open");
  if (!pagesContainer.children.length) createPage();
});

/* CREATE PAGE */
function createPage() {
  const page = document.createElement("div");
  page.className = "page";

  page.innerHTML = `
    <div class="page-header" style="position: relative;">
      <h3 class="text-center m-3">Todo List</h3>
      <button class="delete-page-btn" title="Delete Page" style="
        position: absolute;
        top: 12px;
        left: 5px;
        border: none;
        background: transparent;
        font-size: 18px;
        cursor: pointer;
      "><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="input-group mb-3">
        <input type="text" class="form-control task-input" placeholder="Add new task">
        <button class="btn btn-primary add-btn">Add</button>
    </div>
    <ul class="list-group task-list"></ul>
  `;

  pagesContainer.appendChild(page);
  showPage(currentPageIndex);

  const addBtn = page.querySelector(".add-btn");
  const taskInput = page.querySelector(".task-input");
  const deletePageBtn = page.querySelector(".delete-page-btn");

  // Mobile-friendly: click + touch
  addBtn.addEventListener("click", () => addTask(taskInput));
  addBtn.addEventListener("touchstart", (e) => { e.preventDefault(); addTask(taskInput); });

  // Enter key
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask(taskInput);
  });

  // Delete page
  deletePageBtn.addEventListener("click", () => deletePage(page));
}

/* ADD TASK */
function addTask(input) {
  const text = input.value.trim();
  if (!text) return;

  allTasks.push(text);
  input.value = "";
  renderPages();
}

/* DELETE PAGE */
function deletePage(page) {
  page.classList.add("fade-out");
  setTimeout(() => {
    const pageIndex = Array.from(pagesContainer.children).indexOf(page);
    if (pageIndex > -1) {
      const start = pageIndex * tasksPerPage;
      allTasks.splice(start, tasksPerPage);
      renderPages();
      if (currentPageIndex >= pagesContainer.children.length) currentPageIndex = pagesContainer.children.length - 1;
      showPage(currentPageIndex);
      updateNavButtons();
    }
  }, 400);
}

/* RENDER PAGES */
function renderPages() {
  pagesContainer.innerHTML = "";

  const totalPages = Math.ceil(allTasks.length / tasksPerPage);

  for (let i = 0; i < totalPages; i++) {
    createPage();
    const page = pagesContainer.children[i];
    const taskList = page.querySelector(".task-list");

    const start = i * tasksPerPage;
    const end = start + tasksPerPage;

    allTasks.slice(start, end).forEach((taskText, idx) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <input type="checkbox" class="form-check-input">
        <span class="task-text">${taskText}</span>
        <button class="delete-btn">✖</button>
      `;

      const checkbox = li.querySelector("input");
      const text = li.querySelector(".task-text");
      const deleteBtn = li.querySelector(".delete-btn");

      // Toggle complete
      checkbox.addEventListener("change", () => text.classList.toggle("completed"));

      // Delete task
      deleteBtn.addEventListener("click", () => {
        li.classList.add("fade-out");
        setTimeout(() => {
          allTasks.splice(start + idx, 1);
          renderPages();
        }, 300);
      });

      taskList.appendChild(li);
    });
  }

  showPage(currentPageIndex);
  updateNavButtons();
  addPageNumbers();
}

/* SHOW PAGE */
function showPage(index) {
  Array.from(pagesContainer.children).forEach((p, i) => {
    p.style.transform = `translateX(${(i - index) * 100}%)`;
    p.style.opacity = i === index ? 1 : 0;
  });
}

/* UPDATE NAV BUTTONS */
function updateNavButtons() {
  prevPageBtn.disabled = currentPageIndex === 0;
  nextPageBtn.disabled = currentPageIndex === pagesContainer.children.length - 1;
}

/* NAVIGATION BUTTONS */
prevPageBtn.addEventListener("click", () => navigatePage(-1));
nextPageBtn.addEventListener("click", () => navigatePage(1));

function navigatePage(direction) {
  if (showAllPages) {
    showAllPages = false;
    Array.from(pagesContainer.children).forEach((page) => {
      page.style.display = "block";
      page.style.transform = "";
      page.style.opacity = "";
      page.style.zIndex = "";
    });
  }
  currentPageIndex += direction;
  if (currentPageIndex < 0) currentPageIndex = 0;
  if (currentPageIndex >= pagesContainer.children.length) currentPageIndex = pagesContainer.children.length - 1;
  showPage(currentPageIndex);
  updateNavButtons();
}

/* SHOW ALL / SPREAD PAGES */
centerPageBtn.addEventListener("click", () => {
  showAllPages = !showAllPages;
  if (showAllPages) showAll();
  else {
    Array.from(pagesContainer.children).forEach((page) => {
      page.style.display = "block";
      page.style.zIndex = "";
    });
    showPage(currentPageIndex);
    updateNavButtons();
  }
});

function showAll() {
  const pages = Array.from(pagesContainer.children);
  const total = pages.length;
  const containerWidth = pagesContainer.offsetWidth;

  pages.forEach((page, i) => {
    page.style.display = "block";
    page.style.position = "absolute";
    page.style.transformOrigin = "left center";
    page.style.cursor = "pointer";

    const fraction = i / (total - 1);
    const fanOffsetX = fraction * (containerWidth * 0.4);
    const fanOffsetY = fraction * 5;
    const rotateY = -5 + Math.pow(fraction, 1.5) * 25;
    const rotateZ = -1 + fraction * 4;

    page.style.transform = `translate(${fanOffsetX}px, ${fanOffsetY}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    page.style.zIndex = -i;
    page.style.opacity = 2.5;

    page.onclick = () => {
      showAllPages = false;
      currentPageIndex = i;
      page.style.transition = "transform 0.4s ease";
      page.style.transform = "translate(0px,0px) scale(1.05) rotateY(0deg) rotateZ(0deg)";
      setTimeout(() => {
        pages.forEach(p => { p.style.transform = ""; p.style.zIndex = ""; });
        showPage(currentPageIndex);
        updateNavButtons();
      }, 400);
    };
  });
}

/* PAGE NUMBERS */
function addPageNumbers() {
  Array.from(pagesContainer.children).forEach((page, i) => {
    let pageNumber = page.querySelector(".page-number");
    if (!pageNumber) {
      pageNumber = document.createElement("div");
      pageNumber.classList.add("page-number");
      page.appendChild(pageNumber);
    }
    pageNumber.textContent = i + 1;
  });
}

/* INITIAL TASKS */
const tasks = [
  "Buy groceries", "Finish project", "Call friend", "Clean room",
  "Read a book", "Workout", "Study JavaScript", "Reply to emails"
];

for (let i = 0; i < 200; i++) {
  const random = tasks[Math.floor(Math.random() * tasks.length)];
  allTasks.push(random + " " + (i + 1));
}

renderPages();
addPageNumbers();