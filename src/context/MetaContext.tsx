import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { UserData } from "../utils/storage";
import {
  loadCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
} from "../utils/storage";

type AppStage = "login" | "entrance" | "car" | "level" | "game";

type MetaContextType = {
  currentUser: UserData | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  appStage: AppStage;
  setAppStage: React.Dispatch<React.SetStateAction<AppStage>>;
  selectedCar: string | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
};

const MetaContext = createContext<MetaContextType | undefined>(undefined);

export function MetaProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [appStage, setAppStage] = useState<AppStage>("login");
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  // 🔹 Auto-load current user on app start
  useEffect(() => {
    const savedUser = loadCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      setAppStage("entrance"); // skip login if user found
    }
  }, []);

  // 🔹 Keep current user in localStorage when updated
  useEffect(() => {
    if (currentUser) {
      saveCurrentUser(currentUser);
    }
  }, [currentUser]);

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setAppStage("login");
  };

  return (
    <MetaContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        appStage,
        setAppStage,
        selectedCar,
        setSelectedCar,
        logout,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
}

export function useMeta() {
  const ctx = useContext(MetaContext);
  if (!ctx) throw new Error("useMeta must be used inside MetaProvider");
  return ctx;
}
