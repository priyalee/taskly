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

/* Resize */
window.addEventListener("resize", () => {
  tasksPerPage = getTasksPerPage();
  renderPages();
});

/* COVER */
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

  addBtn.addEventListener("click", () => addTask(taskInput));

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask(taskInput);
  });

  // Delete page with animation
  deletePageBtn.addEventListener("click", () => {
    page.classList.add("fade-out"); // trigger animation

    setTimeout(() => {
      const pageIndex = Array.from(pagesContainer.children).indexOf(page);
      if (pageIndex > -1) {
        // Remove tasks of this page
        const start = pageIndex * tasksPerPage;
        allTasks.splice(start, tasksPerPage);

        // Re-render pages
        renderPages();

        // Adjust currentPageIndex
        if (currentPageIndex >= pagesContainer.children.length) {
          currentPageIndex = pagesContainer.children.length - 1;
        }
        showPage(currentPageIndex);
        updateNavButtons();
      }
    }, 400); // match animation duration
  });
}
/* ADD TASK */
function addTask(input) {
  const task = input.value.trim();
  if (!task) return;

  allTasks.push(task);
  input.value = "";
  renderPages();
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

    allTasks.slice(start, end).forEach((taskText) => {
      const li = document.createElement("li");

      li.className = "list-group-item";

      li.innerHTML = `
                <input type="checkbox" class="form-check-input">
                <span class="task-text">${taskText}</span>
                <button class="delete-btn">✖</button>
            `;

      taskList.appendChild(li);

      const checkbox = li.querySelector("input");
      const text = li.querySelector(".task-text");

      checkbox.addEventListener("change", () =>
        text.classList.toggle("completed"),
      );

      const deleteBtn = li.querySelector(".delete-btn");

      deleteBtn.addEventListener("click", () => {
        li.classList.add("fade-out");

        setTimeout(() => {
          allTasks = allTasks.filter((t) => t !== taskText);
          renderPages();
        }, 300);
      });
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

/* UPDATE BUTTONS */
function updateNavButtons() {
  prevPageBtn.disabled = currentPageIndex === 0;

  nextPageBtn.disabled =
    currentPageIndex === pagesContainer.children.length - 1;
}

/* PREVIOUS BUTTON */
prevPageBtn.addEventListener("click", () => {
  if (showAllPages) {
    showAllPages = false;
    const pages = Array.from(pagesContainer.children);

    pages.forEach((page) => {
      page.style.display = "block";
      page.style.transform = "";
      page.style.opacity = "";
      page.style.zIndex = "";
    });

    if (currentPageIndex > 0) currentPageIndex--;

    showPage(currentPageIndex);
    updateNavButtons();
    return;
  }

  if (currentPageIndex > 0) {
    currentPageIndex--;

    showPage(currentPageIndex);
    updateNavButtons();
  }
});

/* NEXT BUTTON */
nextPageBtn.addEventListener("click", () => {
  if (showAllPages) {
    showAllPages = false;
    const pages = Array.from(pagesContainer.children);

    pages.forEach((page) => {
      page.style.display = "block";
      page.style.transform = "";
      page.style.opacity = "";
      page.style.zIndex = "";
    });

    if (currentPageIndex < pagesContainer.children.length - 1) {
      currentPageIndex++;
    }

    showPage(currentPageIndex);
    updateNavButtons();
    return;
  }

  if (currentPageIndex < pagesContainer.children.length - 1) {
    currentPageIndex++;

    showPage(currentPageIndex);
    updateNavButtons();
  }
});

/* SHOW ALL PAGES */
function showAll() {
  const pages = Array.from(pagesContainer.children);
  const total = pages.length;
  const containerWidth = pagesContainer.offsetWidth; // responsive base

  pages.forEach((page, i) => {
    page.style.display = "block";
    page.style.position = "absolute";
    page.style.transformOrigin = "left center"; 
    page.style.cursor = "pointer";

    // Responsive fraction
    const fraction = i / (total - 1);

    // Horizontal & vertical offsets scaled to container
    const fanOffsetX = fraction * (containerWidth * 0.4); // up to 40% width spread
    const fanOffsetY = fraction * 5; // small vertical layering

    // Rotate: less left tilt, more right tilt
    const rotateY = -5 + Math.pow(fraction, 1.5) * 25; 
    const rotateZ = -1 + fraction * 4;

    page.style.transform = `translate(${fanOffsetX}px, ${fanOffsetY}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    page.style.zIndex = -i;
    page.style.opacity = 2.5;

    // Click to open page
    page.onclick = () => {
      showAllPages = false;
      currentPageIndex = i;

      page.style.transition = "transform 0.4s ease";
      page.style.transform = "translate(0px,0px) scale(1.05) rotateY(0deg) rotateZ(0deg)";

      setTimeout(() => {
        pages.forEach(p => {
          p.style.transform = "";
          p.style.zIndex = "";
        });
        showPage(currentPageIndex);
        updateNavButtons();
      }, 400);
    };
  });
}
/* CENTER BUTTON */
centerPageBtn.addEventListener("click", () => {
  showAllPages = !showAllPages;

  if (showAllPages) {
    showAll(); // spread pages
  } else {
    // return to normal notebook mode
    const pages = Array.from(pagesContainer.children);

    pages.forEach((page) => {
      page.style.display = "block"; // IMPORTANT FIX
      page.style.zIndex = "";
    });

    showPage(currentPageIndex);
    updateNavButtons();
  }
});


function addPageNumbers() {
  const pages = Array.from(pagesContainer.children);

  pages.forEach((page, i) => {
    let pageNumber = page.querySelector(".page-number");

    if (!pageNumber) {
      pageNumber = document.createElement("div");
      pageNumber.classList.add("page-number");
      page.appendChild(pageNumber);
    }

    pageNumber.textContent = i + 1;
  });
}

renderPages();
addPageNumbers();