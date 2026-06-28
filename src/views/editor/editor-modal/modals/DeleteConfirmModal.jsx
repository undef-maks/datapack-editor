import { useEditor } from "../../../../context/EditorContext";
import Modal from "../../../../components/modal/Modal";
export default function DeleteConfirmModal({ path, onClose }) {
  const { handleDelete, setFileSystem, setActiveModal } = useEditor();

  return (
    <Modal isOpen={!!path} onClose={onClose} title="Підтвердження видалення">
      <div className="delete-modal-body">
        <p>
          Ви дійсно хочете видалити: <strong>{path}</strong>?
        </p>
        <div className="modal-actions">
          <button
            className="submit-btn"
            onClick={() => {
              handleDelete(path, setFileSystem);
              setActiveModal(null);
            }}
          >
            Видалити
          </button>
          <button onClick={onClose}>Скасувати</button>
        </div>
      </div>
    </Modal>
  );
}
