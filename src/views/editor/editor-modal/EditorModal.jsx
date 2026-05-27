import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/Modal";
import LayoutModal from "./modals/LayoutModal";
import CreateModal from "./modals/CreateModal";

export default function EditorModal(props) {
  const { t } = useTranslation();
  const { activeModal, onClose } = props;

  if (!activeModal) return null;

  const isLayoutMode = activeModal.type === "layout";

  const getTitle = () => {
    if (isLayoutMode) return t("modal_title_change_layout");
    return activeModal.type === "folder"
      ? t("modal_title_create_folder")
      : t("modal_title_create_file");
  };

  return (
    <Modal isOpen={!!activeModal} onClose={onClose} title={getTitle()}>
      <div className="modal-body">
        {isLayoutMode ? (
          <LayoutModal {...props} path={activeModal.path} />
        ) : (
          <CreateModal
            {...props}
            type={activeModal.type}
            path={activeModal.path}
          />
        )}
      </div>
    </Modal>
  );
}
