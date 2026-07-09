import { useTranslation } from "react-i18next";
import { set } from "idb-keyval";
import Modal from "../Modal";
import { addRecentProject } from "../../../utils/recentProjects";
import { useRecentProjects } from "../../../hooks/useRecentProjects";

export default function OpenProjectModal({
  isOpen,
  onClose,
  setView,
  setDirectoryHandle,
}) {
  const { t } = useTranslation();
  const { refreshProjects } = useRecentProjects();

  const handleOpenExisting = async () => {
    try {
      const dir = await window.showDirectoryPicker();
      await set(`handle-${dir.name}`, dir);
      addRecentProject(dir.name, "Unknown");
      refreshProjects();
      setDirectoryHandle(dir);
      setView("datapack_editor");
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("open_datapack")}>
      <button className="submit-btn" onClick={handleOpenExisting}>
        {t("dashboard_btn_open")}
      </button>
    </Modal>
  );
}
