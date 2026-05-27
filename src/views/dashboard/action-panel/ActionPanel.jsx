import { useTranslation } from "react-i18next";
import { IoAddCircleOutline, IoFolderOpenOutline } from "react-icons/io5";
import "./ActionPanel.css";

export default function ActionPanel({ onCreateClick, onOpenClick }) {
  const { t } = useTranslation();

  return (
    <div className="dashboard-main">
      <div className="dashboard-actions">
        <button className="action-card" onClick={onCreateClick}>
          <div className="card-icon">
            <IoAddCircleOutline />
          </div>
          <div className="card-text">
            <h3>{t("create_datapack")}</h3>
            <p>{t("dashboard_create_desc")}</p>
          </div>
        </button>
        <button className="action-card" onClick={onOpenClick}>
          <div className="card-icon">
            <IoFolderOpenOutline />
          </div>
          <div className="card-text">
            <h3>{t("open_datapack")}</h3>
            <p>{t("dashboard_open_desc")}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
