import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Registrar Service Worker com força total
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('SW registrado:', reg.scope);
        // Força atualização se houver nova versão
        reg.update();
      })
      .catch(err => console.log('Erro SW:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);