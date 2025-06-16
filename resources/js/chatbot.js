import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat');

const firebaseConfig = {
    apiKey: "AIzaSyDAhcqyzf8x1FXd0Zqka12t_NQaoCEWD44",
    authDomain: "flexi-task-5d512.firebaseapp.com",
    projectId: "flexi-task-5d512",
    appId: "1:161145697554:web:23d9c0c67426e92a97afcb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let messages = [];

// ✅ Simpan user login ke localStorage
function cacheUser(user) {
    const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || ""
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    currentUser = userData;
}

// ✅ Simpan ke Firestore
async function saveMessageToFirestore(role, text) {
    if (!currentUser) return;
    try {
        const ref = collection(db, `users/${currentUser.uid}/chat_messages`);
        await addDoc(ref, {
            role,
            text,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("❌ Error saving chat to Firestore:", error);
    }
}

// ✅ Ambil histori dari Firestore
async function loadChatHistory() {
    if (!currentUser) return;
    try {
        const ref = collection(db, `users/${currentUser.uid}/chat_messages`);
        const q = query(ref, orderBy('timestamp'));
        const snapshot = await getDocs(q);
        chatArea.innerHTML = '';
        snapshot.forEach(doc => {
            const chat = doc.data();
            const text = chat.message || chat.text || "";
            const isUser = chat.isUser ?? (chat.role === 'user');

            if (isUser) renderUserMessage(text, false);
            else renderBotMessage(text, false);
        });
        scrollToBottom();
    } catch (error) {
        console.error("❌ Error loading chat history:", error);
    }
}


// Fungsi render pesan user
function renderUserMessage(text, save = true) {
    const div = document.createElement('div');
    div.className = 'user-message';
    div.textContent = text;
    chatArea.appendChild(div);
    if (save) saveMessageToFirestore('user', text);
}

// Fungsi render pesan bot
function renderBotMessage(text, save = true) {
    if (!text || typeof text !== "string") {
        console.warn("⚠️ Bot message kosong atau bukan string:", text);
        return;
    }
    const div = document.createElement('div');
    div.className = 'bot-message';
    div.textContent = text;
    chatArea.appendChild(div);
    if (save) saveMessageToFirestore('assistant', text);
}


// Scroll otomatis ke bawah
function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Fungsi kirim ke API Groq
async function sendMessage() {
    const inputText = messageInput.value.trim();
    if (!inputText) return;

    renderUserMessage(inputText);
    scrollToBottom();
    messageInput.value = "";

    messages.push({ role: "user", content: inputText });

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: "Kamu adalah asisten pribadi pengguna terkait manajemen tugas." },
                    ...messages
                ]
            })
        });

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;

        if (reply) {
            messages.push({ role: "assistant", content: reply });
            renderBotMessage(reply);
        } else {
            renderBotMessage("⚠️ Bot tidak membalas. Cek API key atau model.");
        }

        scrollToBottom();
    } catch (error) {
        console.error("Groq Chat Error:", error);
        renderBotMessage("❌ Terjadi kesalahan koneksi.");
    }
}

// Event listener
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
newChatButton.addEventListener("click", () => {
    messages = [];
    chatArea.innerHTML = "";
    renderBotMessage("Halo! Saya asisten tugas kamu. Ada yang bisa dibantu?");
});

// ✅ Cek login Firebase Auth saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            cacheUser(user);
            loadChatHistory();
        } else {
            renderBotMessage("Halo! Silakan login terlebih dahulu.");
        }
    });
});
