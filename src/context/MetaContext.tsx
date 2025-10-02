import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { UserData } from "../utils/storage";

type AppStage = "login" | "entrance" | "car" | "level" | "game";

type MetaContextType = {
  currentUser: UserData | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  appStage: AppStage;
  setAppStage: React.Dispatch<React.SetStateAction<AppStage>>;
  selectedCar: string | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<string | null>>;
};

const MetaContext = createContext<MetaContextType | undefined>(undefined);

export function MetaProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [appStage, setAppStage] = useState<AppStage>("login");
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  return (
    <MetaContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        appStage,
        setAppStage,
        selectedCar,
        setSelectedCar,
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
