// storage.ts
export type UserData = {
  username: string;
  password: string;
  levels: number[]; // [1,0,0] etc
  selectedCar?: string; // optional: path to chosen car
};

const STORAGE_KEY = "users";
const CURRENT_KEY = "currentUser"; // 👈 new key for last logged-in user

// --- User list handling ---
export function loadUsers(): UserData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: UserData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function findUser(username: string, password: string): UserData | null {
  const users = loadUsers();
  return (
    users.find((u) => u.username === username && u.password === password) ||
    null
  );
}

// 🔹 New: find user by username only (for duplicate check)
export function findUserByUsername(username: string): UserData | null {
  const users = loadUsers();
  return users.find((u) => u.username === username) || null;
}

export function createUser(username: string, password: string): UserData {
  const newUser: UserData = {
    username,
    password,
    levels: [1, 0, 0],
    selectedCar: undefined,
  };
  const users = loadUsers();
  users.push(newUser);
  saveUsers(users);

  // Save as current user immediately after signup
  saveCurrentUser(newUser);

  return newUser;
}

// --- Current user handling (for auto-login) ---
export function saveCurrentUser(user: UserData) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
}

export function loadCurrentUser(): UserData | null {
  const data = localStorage.getItem(CURRENT_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_KEY);
}
