const cover = document.getElementById("cover");
const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

/* COVER FLIP */

cover.addEventListener("click",()=>{
cover.classList.add("open");
});

/* ADD TASK */

addBtn.addEventListener("click",addTask);

taskInput.addEventListener("keypress",function(e){
if(e.key==="Enter"){
addTask();
}
});

function addTask(){

const task = taskInput.value.trim();

if(task==="") return;

const li = document.createElement("li");
li.className="list-group-item";

li.innerHTML = `
<input type="checkbox" class="form-check-input">
<span class="task-text">${task}</span>
<button class="delete-btn">✖</button>
`;

taskList.appendChild(li);

taskInput.value="";

/* COMPLETE TASK */

const checkbox = li.querySelector("input");
const text = li.querySelector(".task-text");

checkbox.addEventListener("change",()=>{
text.classList.toggle("completed");
});

/* DELETE TASK */

const deleteBtn = li.querySelector(".delete-btn");

deleteBtn.addEventListener("click",()=>{
li.classList.add("fade-out");

setTimeout(()=>{
li.remove();
},300);

});

}