import { useTranslation } from "react-i18next";
import { IoSettingsOutline } from "react-icons/io5";
import "./Header.css";

export default function Header({ view, setView, onOpenSettings }) {
  const { t } = useTranslation();

  return (
    <header className="app-header">
      <div className="header-brand" onClick={() => setView("dashboard")}>
        <span className="logo">DATAPACK WORKSHOP</span>
        {view !== "dashboard" && (
          <span className="view-mode">
            {view === "layout_editor" ? t("layout_mode") : t("project_mode")}
          </span>
        )}
      </div>
      <button className="settings-btn" onClick={onOpenSettings}>
        <IoSettingsOutline />
        {t("settings_button")}
      </button>
    </header>
  );
}
