import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

// Variabel sementara untuk restore
let selectedTaskId = null;
let selectedTaskSource = null;

// Ambil user login dari localStorage
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Ambil semua task yang selesai dari Firestore (dari dua lokasi berbeda)
async function loadCompletedTasksForCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  let completedTasks = [];

  // 1. Dari /tasks
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

  // 2. Dari /completed_tasks
  try {
    const completedTasksRef = collection(db, "users", currentUser.uid, "completed_tasks");
    const snapshot2 = await getDocs(completedTasksRef);
    const tasksFromCompleted = snapshot2.docs.map((doc) => ({
      id: doc.id,
      source: "completed_tasks",
      ...doc.data(),
    }));
    completedTasks = completedTasks.concat(tasksFromCompleted);
  } catch (e) {
    console.warn("Gagal load dari /completed_tasks:", e.message);
  }

  console.log("Total completed tasks loaded:", completedTasks.length);
  return completedTasks;
}

// Fungsi untuk me-restore task
async function restoreTask(taskId, event) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToastMessage("Error: User not found");
    return;
  }

  const uid = currentUser.uid;

  try {
    const source = selectedTaskSource;

    if (source === "completed_tasks") {
      const completedDocRef = doc(db, "users", uid, "completed_tasks", taskId);
      const snap = await getDoc(completedDocRef);
      const data = snap.data();

      if (!data) throw new Error("Data not found in completed_tasks");

      await setDoc(doc(db, "users", uid, "tasks", taskId), {
        ...data,
        isCompleted: false,
        completed: false,
        completedDate: null,
      });

      await deleteDoc(completedDocRef);
    } else {
      const taskRef = doc(db, "users", uid, "tasks", taskId);
      await updateDoc(taskRef, {
        isCompleted: false,
        completed: false,
        completedDate: null,
      });
    }

    showToastMessage("✅ Task restored successfully");
    await renderTasks();
  } catch (e) {
    console.error("❌ Error restoring task:", e);
    showToastMessage("Failed to restore task: " + e.message);
  }
}

// Render ulang daftar task yang selesai
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
    taskCard.className = "card task-card mb-2";
    taskCard.setAttribute("data-task-id", task.id);
    taskCard.setAttribute("data-source", task.source);

    taskCard.innerHTML = `
      <div class="card-body p-3">
        <div class="d-flex justify-content-between">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center">
              ${task.priority > 1
                ? `<div class="priority-${task.priority === 3 ? "high" : "medium"} me-2"></div>`
                : ""}
              <h6 class="completed-title mb-0">${task.title}</h6>
            </div>
            ${task.description ? `<p class="task-description mb-1">${task.description}</p>` : ""}
            <p class="completion-date text-muted small mb-0">Completed on ${task.completedDate || "-"}</p>
          </div>
        </div>
      </div>
    `;

    // Saat diklik, tampilkan modal restore
    taskCard.addEventListener("click", () => {
      selectedTaskId = task.id;
      selectedTaskSource = task.source;

      const modal = new bootstrap.Modal(document.getElementById("restoreConfirmModal"));
      modal.show();
    });

    taskListContainer.appendChild(taskCard);
  });
}

// Saat tombol "Yes, Restore" ditekan
document.getElementById("confirmRestoreBtn").addEventListener("click", async () => {
  if (selectedTaskId) {
    // Tutup modal popup
    const modalEl = document.getElementById("restoreConfirmModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    // Lanjut restore
    await restoreTask(selectedTaskId);
    selectedTaskId = null;
    selectedTaskSource = null;
  }
});


// Inisialisasi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  console.log("Initializing completed tasks page");
  await renderTasks();
  setupProfileImage(currentUser);
});

// Dummy toast (ganti sesuai implementasimu)
function showToastMessage(msg) {
  //alert(msg); // Ganti ini dengan toast UI sesuai proyekmu
}
