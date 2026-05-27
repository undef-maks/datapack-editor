import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IoTimeOutline, IoChevronForward } from "react-icons/io5";
import { set, get } from "idb-keyval";
import Modal from "../../components/modal/Modal";
import ActionPanel from "./action-panel/ActionPanel";
import FileStructurePreview from "../../components/file-structure/FileStructurePreview";
import { createDatapackStructure } from "../../utils/datapackUtils";
import {
  addRecentProject,
  getRecentProjects,
} from "../../utils/recentProjects";
import "./Dashboard.css";

export default function Dashboard({ setView, setDirectoryHandle }) {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);
  const [folderHandle, setFolderHandle] = useState(null);
  const [gameName, setGameName] = useState("");
  const [datapackName, setDatapackName] = useState("");
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    setRecentProjects(getRecentProjects());
  }, []);

  const handleCreate = async () => {
    if (!folderHandle || !gameName || !datapackName) return;

    const newDir = await folderHandle.getDirectoryHandle(datapackName, {
      create: true,
    });
    await createDatapackStructure(newDir, gameName, datapackName);

    await set(`handle-${datapackName}`, newDir);

    addRecentProject(datapackName, gameName);
    setRecentProjects(getRecentProjects());
    setDirectoryHandle(newDir);
    setView("datapack_editor");
  };

  const openProject = async (name, handle) => {
    // Перевірка дозволу
    if ((await handle.queryPermission({ mode: "readwrite" })) !== "granted") {
      if ((await handle.requestPermission({ mode: "readwrite" })) !== "granted")
        return;
    }
    setDirectoryHandle(handle);
    setView("datapack_editor");
  };

  const handleOpenExisting = async () => {
    try {
      const dir = await window.showDirectoryPicker();
      await set(`handle-${dir.name}`, dir);
      addRecentProject(dir.name, "Unknown");
      setRecentProjects(getRecentProjects());
      setDirectoryHandle(dir);
      setView("datapack_editor");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <ActionPanel
          onCreateClick={() => setActiveModal("pack")}
          onOpenClick={() => setActiveModal("open")}
        />
        <div className="dashboard-recent">
          <div className="recent-header">
            <IoTimeOutline />
            <span>{t("recent_projects")}</span>
          </div>
          <div className="recent-list">
            {recentProjects.map((proj) => (
              <div key={proj.id} className="recent-item">
                <div className="item-info">
                  <h4>{proj.name}</h4>
                  <span>{proj.game}</span>
                </div>
                <div className="item-meta">
                  <button
                    className="open-recent-btn"
                    onClick={async () => {
                      const handle = await get(`handle-${proj.name}`);
                      if (handle) openProject(proj.name, handle);
                      else alert("Папку не знайдено, оберіть її через 'Open'");
                    }}
                  >
                    <IoChevronForward />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={activeModal === "pack"}
        onClose={() => setActiveModal(null)}
        title={t("create_datapack")}
      >
        <input
          type="text"
          placeholder="Назва гри"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Назва датапаку"
          value={datapackName}
          onChange={(e) => setDatapackName(e.target.value)}
        />
        <button
          onClick={async () =>
            setFolderHandle(await window.showDirectoryPicker())
          }
        >
          {folderHandle ? "Папку обрано" : "Оберіть місце для проекту"}
        </button>
        <button
          className="submit-btn"
          onClick={handleCreate}
          disabled={!folderHandle}
        >
          {t("dashboard_btn_create")}
        </button>
      </Modal>

      <Modal
        isOpen={activeModal === "open"}
        onClose={() => setActiveModal(null)}
        title={t("open_datapack")}
      >
        <button className="submit-btn" onClick={handleOpenExisting}>
          {t("dashboard_btn_open")}
        </button>
      </Modal>
    </div>
  );
}
