import { useState, useEffect } from "react";
import Dashboard from "./views/dashboard/Dashboard";
import GameLayoutEditor from "./views/layout-editor/GameLayoutEditor";
import DatapackEditor from "./views/editor/DatapackEditor";
import Modal from "./components/modal/Modal";
import "./App.css";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);

  const [lang, setLang] = useState(
    () => localStorage.getItem("dw_lang") || "ua",
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("dw_theme") || "dark",
  );
  const [autoSave, setAutoSave] = useState(
    () => localStorage.getItem("dw_autosave") === "true",
  );

  useEffect(() => {
    localStorage.setItem("dw_lang", lang);
    localStorage.setItem("dw_theme", theme);
    localStorage.setItem("dw_autosave", autoSave);
  }, [lang, theme, autoSave]);

  return (
    <div>
      <header>
        <div>
          <span
            onClick={() => setView("dashboard")}
            style={{ cursor: "pointer" }}
          >
            DATAPACK WORKSHOP
          </span>
          {view !== "dashboard" && (
            <span>
              {view === "layout_editor" ? " [Layout Mode]" : " [Project Mode]"}
            </span>
          )}
        </div>

        <button onClick={() => setIsSettingsOpen(true)}>⚙️ Налаштування</button>
      </header>

      <main>
        {view === "dashboard" && (
          <Dashboard
            setView={setView}
            setDirectoryHandle={setDirectoryHandle}
          />
        )}
        {view === "layout_editor" && <GameLayoutEditor setView={setView} />}
        {view === "datapack_editor" && (
          <DatapackEditor
            setView={setView}
            autoSave={autoSave}
            directoryHandle={directoryHandle}
          />
        )}
      </main>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Глобальні налаштування"
      >
        <div>
          <label>Мова / Language</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="ua">Українська</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label>Тема інтерфейсу</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">Core Dark (Carbon)</option>
            <option value="amoled">Amoled Black</option>
          </select>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Автоматичне збереження
          </label>
        </div>
      </Modal>
    </div>
  );
}
