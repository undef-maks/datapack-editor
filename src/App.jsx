import { useState, useEffect } from "react";
import Header from "./components/header/Header";
import Dashboard from "./views/dashboard/Dashboard";
import DatapackEditor from "./views/editor/DatapackEditor";
import SettingsModal from "./components/settings/SettingsModal";
import "./App.css";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);

  const [settings, setSettings] = useState(() => ({
    lang: localStorage.getItem("dw_lang") || "ua",
    theme: localStorage.getItem("dw_theme") || "dark",
    autoSave: localStorage.getItem("dw_autosave") === "true",
  }));

  useEffect(() => {
    document.body.classList.remove("theme-dark", "theme-amoled", "theme-light");
    document.body.classList.add(`theme-${settings.theme}`);

    localStorage.setItem("dw_theme", settings.theme);
    localStorage.setItem("dw_lang", settings.lang);
    localStorage.setItem("dw_autosave", settings.autoSave);
  }, [settings]);

  return (
    <div className="app-wrapper">
      <Header
        view={view}
        setView={setView}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main>
        {view === "dashboard" && (
          <Dashboard
            setView={setView}
            setDirectoryHandle={setDirectoryHandle}
          />
        )}
        {view === "datapack_editor" && (
          <DatapackEditor
            setView={setView}
            autoSave={settings.autoSave}
            directoryHandle={directoryHandle}
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}
