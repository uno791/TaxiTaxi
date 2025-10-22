import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GameProvider } from "./GameContext";
import { MusicProvider } from "./context/MusicContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MusicProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </MusicProvider>
  </StrictMode>
);
