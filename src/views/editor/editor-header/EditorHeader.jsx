import { VscCloudUpload, VscCheck, VscPlay } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import {
  getFileLayoutId,
  findLayoutById,
  isImageFile,
  isModelFile,
} from "@utils/editorUtils";
import "./EditorHeader.css";

export default function EditorHeader({
  activeFile,
  onSave,
  onBuild,
  isDirty,
  currentLayout,
  fileContent,
  layoutsList,
}) {
  const { t } = useTranslation();

  const getLayoutBadge = () => {
    if (!activeFile) return "";
    if (isImageFile(activeFile))
      return `${activeFile.split(".").pop().toUpperCase()} Image`;
    if (isModelFile(activeFile)) return "3D Model";
    if (currentLayout)
      return currentLayout.info?.name || currentLayout.id || "Unknown Layout";
    const layoutId = getFileLayoutId(fileContent);
    const matchedLayout = findLayoutById(layoutsList, layoutId);
    return matchedLayout
      ? matchedLayout.info?.name || matchedLayout.id
      : layoutId || "Plain JSON";
  };

  const getFileName = () =>
    !activeFile ? "No file selected" : activeFile.split("/").pop();

  const getFolderPath = () => {
    if (!activeFile || !activeFile.includes("/")) return "";
    const parts = activeFile.split("/");
    parts.pop();
    return parts.join("/") + "/";
  };

  const isReadOnly = isImageFile(activeFile) || isModelFile(activeFile);

  return (
    <div className="panel-header">
      <div className="header-meta">
        {activeFile ? (
          <>
            <div className="file-info-group">
              <span className="file-directory">{getFolderPath()}</span>
              <span className={`file-name ${isDirty ? "file-dirty" : ""}`}>
                {getFileName()}
              </span>
            </div>
            <span className="layout-badge">{getLayoutBadge()}</span>
          </>
        ) : (
          <span className="no-file-text">{t("header_no_file")}</span>
        )}
      </div>

      <div className="header-actions">
        {activeFile && !isReadOnly && (
          <button
            className={`action-btn save-btn ${!isDirty ? "saved" : ""}`}
            onClick={onSave}
            disabled={!isDirty}
          >
            {isDirty ? <VscCloudUpload /> : <VscCheck />}
            <span>
              {isDirty ? t("header_btn_save") : t("header_btn_saved")}
            </span>
          </button>
        )}

        {activeFile && (
          <button className="action-btn build-btn" onClick={onBuild}>
            <VscPlay />
            <span>{t("header_btn_build")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
