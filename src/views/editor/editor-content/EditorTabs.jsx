import { VscCode, VscListSelection, VscSettings } from "react-icons/vsc";

const EditorTabs = ({
  viewMode,
  setViewMode,
  isLayoutLoading,
  isMigrationFile,
}) => (
  <div className="view-mode-tabs">
    {isMigrationFile ? (
      <>
        <button
          className={`tab-button ${viewMode === "migration" ? "active" : ""}`}
          onClick={() => setViewMode("migration")}
        >
          <VscSettings /> <span>Налаштування міграції</span>
        </button>
        <button
          className={`tab-button ${viewMode === "json" ? "active" : ""}`}
          onClick={() => setViewMode("json")}
        >
          <VscCode /> <span>JSON</span>
        </button>
      </>
    ) : (
      <>
        <button
          className={`tab-button ${viewMode === "form" ? "active" : ""}`}
          onClick={() => setViewMode("form")}
          disabled={isLayoutLoading}
        >
          <VscListSelection /> <span>Форма</span>
        </button>
        <button
          className={`tab-button ${viewMode === "json" ? "active" : ""}`}
          onClick={() => setViewMode("json")}
          disabled={isLayoutLoading}
        >
          <VscCode /> <span>JSON Редактор</span>
        </button>
      </>
    )}
  </div>
);
export default EditorTabs;
