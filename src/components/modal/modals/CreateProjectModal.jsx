import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { set } from "idb-keyval";
import Modal from "../Modal";
import FileStructurePreview from "../../file-structure/FileStructurePreview";
import { createDatapackStructure } from "../../../utils/datapackUtils";
import { addRecentProject } from "../../../utils/recentProjects";
import { useRecentProjects } from "../../../hooks/useRecentProjects";

export default function CreateProjectModal({
  isOpen,
  onClose,
  setView,
  setDirectoryHandle,
}) {
  const { t } = useTranslation();
  const { refreshProjects } = useRecentProjects();
  const [folderHandle, setFolderHandle] = useState(null);
  const [gameName, setGameName] = useState("");
  const [datapackName, setDatapackName] = useState("");
  const [error, setError] = useState("");

  const previewStructure = useMemo(() => {
    const base = datapackName || "project_name";
    return [
      { name: `${base}/src`, type: "folder" },
      { name: `${base}/src/data`, type: "folder" },
      { name: `${base}/src/assets`, type: "folder" },
      { name: `${base}/layouts`, type: "folder" },
      { name: `${base}/settings.json`, type: "file" },
      { name: `${base}/manifest.json`, type: "file" },
    ];
  }, [datapackName]);

  const handleCreate = async () => {
    if (!folderHandle) return setError(t("error_select_folder"));
    if (!gameName || !datapackName) return setError(t("error_fill_fields"));

    try {
      const newDir = await folderHandle.getDirectoryHandle(datapackName, {
        create: true,
      });
      await createDatapackStructure(newDir, gameName, datapackName);
      await set(`handle-${datapackName}`, newDir);

      addRecentProject(datapackName, gameName);
      refreshProjects();
      setDirectoryHandle(newDir);
      setView("datapack_editor");
      onClose();
    } catch (err) {
      setError(t("error_create_project"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("create_datapack")}>
      <input
        type="text"
        placeholder={t("placeholder_game_name")}
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
      />
      <input
        type="text"
        placeholder={t("placeholder_datapack_name")}
        value={datapackName}
        onChange={(e) => setDatapackName(e.target.value)}
      />
      <div className="preview-container">
        <FileStructurePreview files={previewStructure} />
      </div>
      <button
        onClick={async () => {
          try {
            const handle = await window.showDirectoryPicker();
            setFolderHandle(handle);
            setError("");
          } catch (err) {}
        }}
      >
        {folderHandle ? t("folder_selected") : t("select_folder_place")}
      </button>
      {folderHandle && (
        <p className="selected-folder-path">
          {t("selected_folder")}: <strong>{folderHandle.name}</strong>
        </p>
      )}
      {error && <p className="error-text">{error}</p>}
      <button className="submit-btn" onClick={handleCreate}>
        {t("dashboard_btn_create")}
      </button>
    </Modal>
  );
}
