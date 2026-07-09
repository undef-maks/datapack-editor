import { useTranslation } from "react-i18next";
import { VscCode, VscListSelection, VscSettings } from "react-icons/vsc";

const EditorTabs = ({
  viewMode,
  setViewMode,
  isLayoutLoading,
  isMigrationFile,
}) => {
  const { t } = useTranslation();

  return (
    <div className="view-mode-tabs">
      {isMigrationFile ? (
        <>
          <button
            className={`tab-button ${viewMode === "migration" ? "active" : ""}`}
            onClick={() => setViewMode("migration")}
          >
            <VscSettings /> <span>{t("tabs_migration_settings")}</span>
          </button>
          <button
            className={`tab-button ${viewMode === "json" ? "active" : ""}`}
            onClick={() => setViewMode("json")}
          >
            <VscCode /> <span>{t("tabs_json")}</span>
          </button>
        </>
      ) : (
        <>
          <button
            className={`tab-button ${viewMode === "form" ? "active" : ""}`}
            onClick={() => setViewMode("form")}
            disabled={isLayoutLoading}
          >
            <VscListSelection /> <span>{t("tabs_ui")}</span>
          </button>
          <button
            className={`tab-button ${viewMode === "json" ? "active" : ""}`}
            onClick={() => setViewMode("json")}
            disabled={isLayoutLoading}
          >
            <VscCode /> <span>{t("tabs_json_editor")}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default EditorTabs;
