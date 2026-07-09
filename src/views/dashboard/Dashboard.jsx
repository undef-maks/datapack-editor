import { useTranslation } from "react-i18next";
import { IoTimeOutline, IoChevronForward } from "react-icons/io5";
import { get } from "idb-keyval";
import ActionPanel from "./action-panel/ActionPanel";
import { useModal } from "../../context/ModalContext";
import { useRecentProjects } from "../../hooks/useRecentProjects";
import "./Dashboard.css";

export default function Dashboard({ setView, setDirectoryHandle }) {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const { recentProjects } = useRecentProjects();

  const openProject = async (name, handle) => {
    if ((await handle.queryPermission({ mode: "readwrite" })) !== "granted") {
      if ((await handle.requestPermission({ mode: "readwrite" })) !== "granted")
        return;
    }
    setDirectoryHandle(handle);
    setView("datapack_editor");
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <ActionPanel
          onCreateClick={() => openModal("pack")}
          onOpenClick={() => openModal("open")}
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
                  <img
                    src="/default-icon.png"
                    alt="Datapack Icon"
                    width={32}
                    className="project-icon"
                  />
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
    </div>
  );
}
