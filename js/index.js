const formEle = document.getElementById("formAdd");
const inputEle = document.getElementById("taskInput");
const addTask = document.getElementById("addTask");

const editBox = document.getElementById("editBox");
const formEdit = document.getElementById("formEdit");
const editInput = document.getElementById("editInput");
const editTask = document.getElementById("editTask");
const cancelTask = document.getElementById("cancelTask");

const loading = document.querySelector(".loading");
let curIndexOfTaskEdit;
let curIdOfTaskEdit;

const apiKey = "676581a560a208ee1fde7e30";

let allTodos = [];

getAllTodos();

formEle.addEventListener("submit", (e) => {
  e.preventDefault();
  if (inputEle.value.trim().length > 0) {
    addTodos();
  }
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

  try {
    loading.classList.remove("d-none");
    const response = await fetch(
      "https://todos.routemisr.com/api/v1/todos",
      option
    );

    if (response.ok) {
      const data = await response.json();
      if (data.message === "success") {
        toastr.success("Added Successfully", "Todo App");
        await getAllTodos();
        formEle.reset();
      }
    }
    loading.classList.add("d-none");
  } catch (error) {
    console.log(error);
  }
}

async function getAllTodos() {
  loading.classList.remove("d-none");
  const response = await fetch(
    `https://todos.routemisr.com/api/v1/todos/${apiKey}`
  );
  if (response.ok) {
    const data = await response.json();
    allTodos = data.todos;
    if (data.message === "success") {
      console.log(data);
      displayTodos();
      checkTaskIsEmpty();
      completedTodos();
    }
  }
  loading.classList.add("d-none");
}

// function displayTodos() {
//   let todoList = ``;
//   for (let i = 0; i < allTodos.length; i++) {
//     todoList += `
//       <li class="d-flex justify-content-between align-items-center col-12 py-2 border-bottom">
//         <span
//         style="${allTodos[i].completed ? "text-decoration: line-through;" : ""}"
//         class="taskName"
//         onclick="markCompleted('${allTodos[i]._id}')"
//         data-tooltip="Click to complete">
//         ${i + 1}- ${allTodos[i].title}
//         </span>
//         <div class="d-flex align-items-center gap-3">
//           ${
//             allTodos[i].completed
//               ? `<span>
//               <i class="fa-regular fa-circle-check" style="color: #63e6be;"></i>
//             </span>`
//               : ""
//           }
//           <span onclick="deleteTodo('${allTodos[i]._id}')"
//           class="icon"><i class="fa-solid fa-trash-can"></i></span>
//         </div>
//       </li>
//     `;
//   }
//   document.getElementById("taskData").innerHTML = todoList;
// }

function displayTodos() {
  const taskData = document.getElementById("taskData");
  taskData.innerHTML = "";
  allTodos.forEach((todo, index) => {
    // Start Li
    const li = document.createElement("li");
    li.className =
      "d-flex justify-content-between align-items-center col-12 py-2 border-bottom";

    // Start taskNameSpan
    let span = document.createElement("span");
    span.style.textDecoration = todo.completed ? "line-through" : "";
    span.className = "taskName";
    span.dataset.todoId = todo._id;
    span.setAttribute("data-tooltip", "Click to complete");
    span.innerText = `${index + 1}- ${todo.title}`;
    if (todo.completed) {
      removeClickEvent(span);
    } else {
      span.addEventListener("click", markCompletedHandler);
    }

    li.appendChild(span);

    // Start iconsDiv
    const div = document.createElement("div");
    div.className = "d-flex align-items-center gap-3";

    // Start checkSpan
    const checkSpan = document.createElement("span");
    checkSpan.innerHTML = todo.completed
      ? `<i class="fa-regular fa-circle-check" style="color: #63e6be;"></i>`
      : "";
    div.appendChild(checkSpan);

    // Start editSpan
    const editSpan = document.createElement("span");
    editSpan.className = "icon bg-warning";
    if (todo.completed) {
      editSpan.classList.add("d-none");
    }
    editSpan.addEventListener("click", () => updateTodo(todo._id, index));
    editSpan.innerHTML = '<i class="fa-solid fa-edit"></i>';
    div.appendChild(editSpan);

    // Start deleteSpan
    const deleteSpan = document.createElement("span");
    deleteSpan.className = "icon";
    deleteSpan.addEventListener("click", () => deleteTodo(todo._id));
    deleteSpan.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    div.appendChild(deleteSpan);

    // Append Div to Li
    li.appendChild(div);

    // Append Li to TaskData
    taskData.appendChild(li);
  });
}

async function deleteTodo(id) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: false,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        loading.classList.remove("d-none");
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
            swalWithBootstrapButtons.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
            });
            getAllTodos();
          }
        }
        checkTaskIsEmpty();
        loading.classList.add("d-none");
      }
    });
}

function markCompletedHandler(event) {
  const id = event.target.dataset.todoId;
  markCompleted(id);
}

async function markCompleted(id) {
  Swal.fire({
    title: "You Want To Complete this?",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Complete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      loading.classList.remove("d-none");
      const todoId = {
        todoId: id,
      };
      const option = {
        method: "PUT",
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
          Swal.fire({
            title: "Your task has been Completed.",
            icon: "success",
          });
          getAllTodos();
        }
      }
      loading.classList.add("d-none");
    }
  });
}

function checkTaskIsEmpty() {
  const taskList = document.getElementById("taskData");
  if (!allTodos.length) {
    taskList.classList.add("d-none");
  } else {
    taskList.classList.remove("d-none");
  }
}

function completedTodos() {
  const allTasks = document.querySelector(".allTasks");
  const completed = document.querySelector(".completed");
  const completedTask = allTodos.filter((todo) => todo.completed);
  allTasks.innerHTML = allTodos.length;
  completed.innerHTML = completedTask.length;
  if (allTodos.length == 0 && completedTask.length == 0) {
    document.querySelector(".todoStatus").classList.add("bg-light");
    document.querySelector(".todoStatus").classList.add("bg-opacity-25");
    document.querySelector(".todoStatus").classList.remove("bg-success");
    document.getElementById("progress").style.width = "0%";
  } else if (allTodos.length > 0 && allTodos.length === completedTask.length) {
    document.querySelector(".todoStatus").classList.remove("bg-light");
    document.querySelector(".todoStatus").classList.remove("bg-opacity-25");
    document.querySelector(".todoStatus").classList.add("bg-success");
    document.getElementById("progress").style.width = "100%";
  } else if (allTodos.length !== completedTask.length) {
    document.querySelector(".todoStatus").classList.add("bg-light");
    document.querySelector(".todoStatus").classList.add("bg-opacity-25");
    document.querySelector(".todoStatus").classList.remove("bg-success");
    document.getElementById("progress").style.width = `${
      (completedTask.length / allTodos.length) * 100
    }%`;
  }
}

function removeClickEvent(spanElement) {
  spanElement.removeEventListener("click", markCompletedHandler);
  spanElement.style.cursor = "not-allowed";
  spanElement.dataset.tooltip = "Task completed";
}

function updateTodo(id, index) {
  curIndexOfTaskEdit = index;
  curIdOfTaskEdit = id;
  editBox.classList.remove("d-none");
  editInput.value = allTodos[index].title;
}

editTask.addEventListener("click", async function () {
  const todoText = {
    title: editInput.value,
    apiKey: apiKey,
  };

  const option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoText),
  };

  try {
    loading.classList.remove("d-none");
    const response = await fetch(
      "https://todos.routemisr.com/api/v1/todos",
      option
    );

    if (response.ok) {
      const data = await response.json();
      if (data.message === "success") {
        await deleted();
        toastr.success("Updated Successfully", "Todo App");
        await getAllTodos();
      }
    }
    editBox.classList.add("d-none");
    loading.classList.add("d-none");
  } catch (error) {
    console.log(error);
  }
});

async function deleted() {
  loading.classList.remove("d-none");
  const todoId = {
    todoId: curIdOfTaskEdit,
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
  checkTaskIsEmpty();
  loading.classList.add("d-none");
}
