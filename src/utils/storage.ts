import type { CityId } from "../constants/cities";
import { CITY_SEQUENCE } from "../constants/cities";

// storage.ts
export type UserData = {
  username: string;
  password: string;
  levels: number[]; // [1,0,0] etc
  selectedCar?: string; // optional: path to chosen car
};

export type GameProgressSave = {
  cityId: CityId;
  completedMissionIds: string[];
  nextMissionId: string | null;
  savedAt: number;
};

const STORAGE_KEY = "users";
const CURRENT_KEY = "currentUser"; // dY`^ new key for last logged-in user
const GAME_PROGRESS_KEY = "taxiTaxiGameProgress";

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

// dY"1 New: find user by username only (for duplicate check)
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

// --- Game progress handling ---
export function saveGameProgress(progress: GameProgressSave) {
  localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress));
}

export function loadGameProgress(): GameProgressSave | null {
  const data = localStorage.getItem(GAME_PROGRESS_KEY);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data) as Partial<GameProgressSave> & {
      cityId?: string;
    };

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const cityId = parsed.cityId;
    if (!cityId || !CITY_SEQUENCE.includes(cityId as CityId)) {
      return null;
    }

    const completedMissionIds = Array.isArray(parsed.completedMissionIds)
      ? parsed.completedMissionIds.filter(
          (value): value is string => typeof value === "string"
        )
      : [];

    const nextMissionId =
      typeof parsed.nextMissionId === "string" ? parsed.nextMissionId : null;

    const savedAt =
      typeof parsed.savedAt === "number" && Number.isFinite(parsed.savedAt)
        ? parsed.savedAt
        : Date.now();

    return {
      cityId: cityId as CityId,
      completedMissionIds,
      nextMissionId,
      savedAt,
    };
  } catch {
    return null;
  }
}

export function clearGameProgress() {
  localStorage.removeItem(GAME_PROGRESS_KEY);
}
