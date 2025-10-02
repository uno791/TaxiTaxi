export type UserData = {
  username: string;
  password: string;
  levels: number[]; // [1,0,0] etc
  selectedCar?: string; // optional: path to chosen car
};

const STORAGE_KEY = "users";

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
  return newUser;
}
