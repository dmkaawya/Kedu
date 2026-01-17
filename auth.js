// Hardcoded users (for demo only – never do this in production)
const users = [
  // Students
  ...Array.from({length:20}, (_,i) => ({
    username: `student${i+1}`,
    password: "pass123",
    role: "student",
    profile: null
  })),
  // Teachers
  ...Array.from({length:8}, (_,i) => ({
    username: `teacher${i+1}`,
    password: "tech123",
    role: "teacher",
    profile: null
  })),
  // Staff
  ...Array.from({length:4}, (_,i) => ({
    username: `staff${i+1}`,
    password: "staff123",
    role: "staff",
    profile: null
  })),
  // Special
  { username: "admin",     password: "admin123", role: "admin", profile: null },
  { username: "kaawya",    password: "kaawya123",role: "owner", profile: null }
];

function initUsers() {
  if (!localStorage.getItem("kedu_users")) {
    localStorage.setItem("kedu_users", JSON.stringify(users));
  }
}

function showModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// Toggle student fields
document.getElementById("regRole")?.addEventListener("change", e => {
  const studentFields = document.getElementById("studentFields");
  studentFields.classList.toggle("hidden", e.target.value !== "student");
});

// Register
document.getElementById("registerForm")?.addEventListener("submit", e => {
  e.preventDefault();
  initUsers();

  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const role     = document.getElementById("regRole").value;

  if (!username || !password || !role) return alert("Please fill all required fields");

  let users = JSON.parse(localStorage.getItem("kedu_users") || "[]");

  if (users.some(u => u.username === username)) {
    return alert("Username already taken");
  }

  let profile = null;
  if (role === "student") {
    profile = {
      grade: document.getElementById("grade").value,
      examLevel: document.getElementById("examLevel").value,
      batch: document.getElementById("batch").value,
      subjects: Array.from(document.getElementById("subjects").selectedOptions).map(opt => opt.value)
    };
  }

  users.push({ username, password, role, profile });
  localStorage.setItem("kedu_users", JSON.stringify(users));
  alert("Registration successful! You can now login.");
  closeModal("registerModal");
  showModal("loginModal");
});

// Login
document.getElementById("loginForm")?.addEventListener("submit", e => {
  e.preventDefault();
  initUsers();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("kedu_users") || "[]");
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return alert("Invalid username or password");

  localStorage.setItem("kedu_current_user", JSON.stringify(user));
  window.location.href = user.role === "admin" || user.role === "owner" ? "admin.html" : "my-class.html";
});

// Auto-check if already logged in
if (localStorage.getItem("kedu_current_user")) {
  const user = JSON.parse(localStorage.getItem("kedu_current_user"));
  if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
    window.location.href = user.role === "admin" || user.role === "owner" ? "admin.html" : "my-class.html";
  }
}
