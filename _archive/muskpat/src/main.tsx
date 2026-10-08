import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { asset } from "./config/assets.ts";
import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/responsive.css";

document.documentElement.style.setProperty("--bg-space", `url("${asset("images/muskpat-bg-space.jpg")}")`);
document.documentElement.style.setProperty("--bg-mars", `url("${asset("images/muskpat-bg-mars.jpg")}")`);
document.documentElement.style.setProperty("--bg-launch", `url("${asset("images/muskpat-bg-launch.jpg")}")`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
