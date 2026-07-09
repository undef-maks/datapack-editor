import { useTranslation } from "react-i18next";
import { useEditor } from "../../../../context/EditorContext";
import Modal from "../../../../components/modal/Modal";

export default function DeleteConfirmModal({ path, onClose }) {
  const { t } = useTranslation();
  const { handleDelete, setFileSystem, setActiveModal } = useEditor();

  return (
    <Modal isOpen={!!path} onClose={onClose} title={t("delete_confirm_title")}>
      <div className="delete-modal-body">
        <p>
          {t("delete_confirm_text")} <strong>{path}</strong>?
        </p>
        <div className="modal-actions">
          <button
            className="submit-btn"
            onClick={() => {
              handleDelete(path, setFileSystem);
              setActiveModal(null);
            }}
          >
            {t("delete")}
          </button>
          <button onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </Modal>
  );
}
