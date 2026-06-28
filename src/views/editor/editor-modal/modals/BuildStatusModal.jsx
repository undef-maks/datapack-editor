import { VscCheck, VscError, VscFiles, VscFolder } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import "./styles/BuildStatusModal.css";

export default function BuildStatusModal({ result, onClose }) {
  const { t } = useTranslation();
  if (!result) return null;

  const { success, stats, error } = result;

  return (
    <div className="build-status-modal">
      <div className={`status-banner ${success ? "success" : "error"}`}>
        {success ? <VscCheck size={32} /> : <VscError size={32} />}
        <h3>{success ? t("build_success") : t("build_error")}</h3>
      </div>

      <div className="status-details">
        <div className="stat-item">
          <VscFolder />
          <span>{t("stats_folders")}</span>
          <strong>{stats?.folders || 0}</strong>
        </div>
        <div className="stat-item">
          <VscFiles />
          <span>{t("stats_files")}</span>
          <strong>{stats?.files || 0}</strong>
        </div>
      </div>

      {!success && (
        <div className="error-log">
          <p>{t("error_desc")}</p>
          <pre>{error}</pre>
        </div>
      )}

      <div className="modal-actions">
        <button className="btn-close" onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </div>
  );
}
