import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

// Ambil user login dari localStorage
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Ambil semua task yang selesai dari Firestore (dari dua lokasi berbeda)
async function loadCompletedTasksForCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  let completedTasks = [];

  // 1. Ambil dari /users/{uid}/tasks dengan isCompleted == true
  try {
    const tasksRef = collection(db, "users", currentUser.uid, "tasks");
    const q1 = query(tasksRef, where("isCompleted", "==", true));
    const snapshot1 = await getDocs(q1);
    const tasksFromTasks = snapshot1.docs.map((doc) => ({
      id: doc.id,
      source: "tasks",
      ...doc.data(),
    }));
    completedTasks = completedTasks.concat(tasksFromTasks);
  } catch (e) {
    console.warn("Gagal load dari /tasks:", e.message);
  }

  // 2. Coba ambil juga dari /users/{uid}/completed_tasks (jika ada)
  try {
    const completedTasksRef = collection(db, "users", currentUser.uid, "completed_tasks");
    const snapshot2 = await getDocs(completedTasksRef);
    const tasksFromCompletedTasks = snapshot2.docs.map((doc) => ({
      id: doc.id,
      source: "completed_tasks",
      ...doc.data(),
    }));
    completedTasks = completedTasks.concat(tasksFromCompletedTasks);
  } catch (e) {
    console.warn("Gagal load dari /completed_tasks:", e.message);
  }

  console.log("Total completed tasks loaded:", completedTasks.length);
  return completedTasks;
}

// Pulihkan task ke status aktif (hanya yang dari /tasks bisa dipulihkan)
async function restoreTask(taskId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToastMessage("Error: User not found");
    return;
  }

  try {
    const taskRef = doc(db, "users", currentUser.uid, "tasks", taskId);

    // Set status task jadi aktif
    await updateDoc(taskRef, {
      isCompleted: false,
      completed: false,
      completedDate: null,
    });

    showToastMessage("Task restored successfully");
    renderTasks();
  } catch (e) {
    console.error("Error restoring task:", e);
    showToastMessage("Error restoring task: " + e.message);
  }
}

// Render ulang task yang selesai
async function renderTasks() {
  const taskListContainer = document.getElementById("taskListContainer");
  const emptyState = document.getElementById("emptyState");

  const completedTasks = await loadCompletedTasksForCurrentUser();

  taskListContainer.innerHTML = "";

  if (completedTasks.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");

  completedTasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = "card task-card";
    taskCard.innerHTML = `
      <div class="card-body p-3">
        <div class="d-flex justify-content-between">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center">
              ${task.priority > 1
                ? `<div class="priority-${
                    task.priority === 3 ? "high" : "medium"
                  }"></div>`
                : ""}
              <h6 class="completed-title">${task.title}</h6>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ""}
            <p class="completion-date">Completed on ${task.completedDate || "-"}</p>
          </div>
          ${
            task.source === "tasks"
              ? `<button class="restore-btn" data-task-id="${task.id}">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>`
              : ""
          }
        </div>
      </div>
    `;

    taskListContainer.appendChild(taskCard);

    const restoreBtn = taskCard.querySelector(".restore-btn");
    if (restoreBtn) {
      restoreBtn.addEventListener("click", function (e) {
        restoreTask(this.dataset.taskId, e);
      });
    }
  });
}

// Inisialisasi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  console.log("Initializing completed tasks page");
  await renderTasks();
  setupProfileImage();
});
