const formEle = document.querySelector("form");
const inputEle = document.querySelector("input");

const apiKey = "676581a560a208ee1fde7e30";

let allTodos = [];

getAllTodos();

formEle.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodos();
});

async function addTodos() {
  const todoText = {
    title: inputEle.value,
    apiKey: apiKey,
  };

  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoText),
  };

  const response = await fetch(
    "https://todos.routemisr.com/api/v1/todos",
    option
  );

  if (response.ok) {
    const data = await response.json();
    if (data.message === "success") {
      console.log(inputEle.value);
      await getAllTodos();
      formEle.reset();
    }
  }
}

async function getAllTodos() {
  const response = await fetch(
    `https://todos.routemisr.com/api/v1/todos/${apiKey}`
  );
  if (response.ok) {
    const data = await response.json();
    allTodos = data.todos;
    if (data.message === "success") {
      console.log(data);
      displayTodos();
    }
  }
}

function displayTodos() {
  let todoList = ``;
  for (let i = 0; i < allTodos.length; i++) {
    todoList += `
      <li class="d-flex justify-content-between align-items-center col-12 py-2 border-bottom">
        <span 
        style="${allTodos[i].completed ? "text-decoration: line-through;" : ""}"
        class="taskName" data-tooltip="Click to complete">
        ${i + 1}- ${allTodos[i].title}
        </span>
        <div class="d-flex align-items-center gap-3">
          ${
            allTodos[i].completed
              ? `
              <span>
                <i
                  class="fa-regular fa-circle-check"
                  style="color: #63e6be;"
                ></i>
              </span>`
              : ""
          }
          <span onclick="deleteTodo('${
            allTodos[i]._id
          }')" class="icon"><i class="fa-solid fa-trash-can"></i></span>
        </div>
      </li>
    `;
  }
  document.getElementById("taskData").innerHTML = todoList;
}

async function deleteTodo(id) {
  console.log(id);
  const todoId = {
    todoId: id,
  };
  const option = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoId),
  };

  const response = await fetch(
    "https://todos.routemisr.com/api/v1/todos",
    option
  );
  if (response.ok) {
    const data = await response.json();
    if (data.message === "success") {
      getAllTodos();
    }
  }
}
