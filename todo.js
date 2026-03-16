const cover = document.getElementById("cover");
const pagesContainer = document.getElementById("pagesContainer");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const notebook = document.querySelector(".notebook");
const centerPageBtn = document.getElementById("centerPage");
const addPageBtn = document.getElementById("addPageBtn");
const previewIndicator = document.getElementById("previewIndicator");

let currentPageIndex = 0;
let allTasks = [];
let showAllPages = false;
let previewPage = 0;
const previewLimit = 10;

function getTasksPerPage() {

  const pageHeight = notebook.clientHeight || 500;

  let lineHeight = 30;

  if (window.innerWidth < 600) lineHeight = 26;
  if (window.innerWidth < 420) lineHeight = 24;

  const padding = 120;

  return Math.max(4, Math.floor((pageHeight - padding) / lineHeight));
}

let tasksPerPage = getTasksPerPage();

/* RESIZE */
let resizeTimer;

window.addEventListener("resize", () => {

  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {

    tasksPerPage = getTasksPerPage();
    renderPages();

  }, 200);

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
        position:absolute;
        top:12px;
        left:5px;
        border:none;
        background:transparent;
        font-size:18px;
        cursor:pointer;
      ">
        <i class="fa-solid fa-trash"></i>
      </button>

    </div>

    <div class="input-group mb-3">
        <input type="text" class="form-control task-input" placeholder="Add new task">
        <button class="btn btn-primary add-btn">Add</button>
    </div>

    <ul class="list-group task-list"></ul>
  `;

  pagesContainer.appendChild(page);

  const addBtn = page.querySelector(".add-btn");
  const taskInput = page.querySelector(".task-input");
  const deletePageBtn = page.querySelector(".delete-page-btn");

  addBtn.addEventListener("click", () => addTask(taskInput));
  addBtn.addEventListener("touchstart", e => { e.preventDefault(); addTask(taskInput); });

  taskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") addTask(taskInput);
  });

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

      if (currentPageIndex >= pagesContainer.children.length)
        currentPageIndex = pagesContainer.children.length - 1;

      showPage(currentPageIndex);
      updateNavButtons();
    }

  }, 400);
}

/* RENDER PAGES */
function renderPages() {

  pagesContainer.innerHTML = "";

  let totalPages = Math.ceil(allTasks.length / tasksPerPage);

  if (totalPages === 0) totalPages = 1;

  if (currentPageIndex >= totalPages)
    currentPageIndex = totalPages - 1;

  for (let i = 0; i < totalPages; i++) {

    createPage();

    const page = pagesContainer.children[i];
    const taskList = page.querySelector(".task-list");

    const start = i * tasksPerPage;
    const end = start + tasksPerPage;

    allTasks.slice(start, end).forEach((taskText, idx) => {

      if (!taskText) return;

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

      checkbox.addEventListener("change", () =>
        text.classList.toggle("completed")
      );

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

  if (pagesContainer.classList.contains("preview-mode")) return;

  const pages = Array.from(pagesContainer.children);

  if (index >= pages.length) index = pages.length - 1;
  if (index < 0) index = 0;

  currentPageIndex = index;

  pages.forEach((p, i) => {

    p.style.transform = `translateX(${(i - index) * 100}%)`;
    p.style.opacity = i === index ? 1 : 0;

  });

}

/* UPDATE NAV BUTTONS */
function updateNavButtons() {

  prevPageBtn.disabled = currentPageIndex === 0;

  nextPageBtn.disabled =
    currentPageIndex === pagesContainer.children.length - 1;
}

/* NAV BUTTONS */
prevPageBtn.addEventListener("click", () => navigatePage(-1));
nextPageBtn.addEventListener("click", () => navigatePage(1));

function navigatePage(direction) {

  const pages = Array.from(pagesContainer.children);

  if (showAllPages) {

    const totalPreviewPages = Math.ceil(pages.length / previewLimit);

    previewPage += direction;

    if (previewPage < 0) previewPage = 0;

    if (previewPage >= totalPreviewPages)
      previewPage = totalPreviewPages - 1;

    showAll();
    return;
  }

  currentPageIndex += direction;

  if (currentPageIndex < 0) currentPageIndex = 0;

  if (currentPageIndex >= pages.length)
    currentPageIndex = pages.length - 1;

  showPage(currentPageIndex);

  updateNavButtons();
}

/* PREVIEW MODE */
centerPageBtn.addEventListener("click", () => {

  showAllPages = !showAllPages;

  if (showAllPages) {

    previewPage = Math.floor(currentPageIndex / previewLimit);

    showAll();

  } else {

    pagesContainer.classList.remove("preview-mode");

    previewIndicator.style.display = "none";

    Array.from(pagesContainer.children).forEach(page => {

      page.style.display = "block";
      page.style.transform = "";
      page.style.opacity = "";

    });

    showPage(currentPageIndex);

    updateNavButtons();
  }

});

function showAll() {

  const pages = Array.from(pagesContainer.children);

  pagesContainer.classList.add("preview-mode");

  const start = previewPage * previewLimit;
  const end = start + previewLimit;

  pages.forEach((page, i) => {

    if (i >= start && i < end)
      page.style.display = "block";
    else
      page.style.display = "none";

    page.onclick = () => {

      showAllPages = false;
      previewPage = 0;

      pagesContainer.classList.remove("preview-mode");

      currentPageIndex = i;

      showPage(currentPageIndex);

      updateNavButtons();

    };

  });

  const totalPreviewPages = Math.ceil(pages.length / previewLimit);

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


/* SWIPE */
let startX = 0;

notebook.addEventListener("touchstart", e => {

  if (e.target.closest("input") || e.target.closest("button")) return;

  startX = e.touches[0].clientX;

});

notebook.addEventListener("touchend", e => {

  const endX = e.changedTouches[0].clientX;

  if (endX - startX > 60) navigatePage(-1);

  if (startX - endX > 60) navigatePage(1);

});

/* SAMPLE TASKS */
// const tasks = [
//   "Buy groceries",
//   "Finish project",
//   "Call friend",
//   "Clean room",
//   "Read a book",
//   "Workout",
//   "Study JavaScript",
//   "Reply to emails"
// ];

// for (let i = 0; i < 500; i++) {

//   const random = tasks[Math.floor(Math.random() * tasks.length)];

//   allTasks.push(random + " " + (i + 1));

// }


renderPages();
addPageNumbers();