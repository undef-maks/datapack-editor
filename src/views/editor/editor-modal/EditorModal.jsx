import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/Modal";
import LayoutModal from "./modals/LayoutModal";
import CreateModal from "./modals/CreateModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import BuildStatusModal from "./modals/BuildStatusModal";
import { useEditor } from "../../../context/EditorContext";
import { useEffect } from "react";

export default function EditorModal() {
  const { t } = useTranslation();
  const {
    activeModal,
    setActiveModal,
    modalInput,
    setModalInput,
    layoutsList,
    onUpdateLayout,
    loadData,
    selectedPaths,
  } = useEditor();

  useEffect(() => {
    if (activeModal && activeModal.type === "layout" && loadData) {
      loadData();
    }
  }, [activeModal?.type]);

  if (!activeModal) return null;

  const isLayoutMode = activeModal.type === "layout";
  const isDeleteMode = activeModal.type === "delete";
  const isBuildStatusMode = activeModal.type === "build-status";

  const getTitle = () => {
    if (isLayoutMode) return t("modal_title_change_layout");
    if (isDeleteMode) return t("modal_title_delete_confirm");
    if (isBuildStatusMode) return "Результат компіляції";
    return activeModal.type === "folder"
      ? t("modal_title_create_folder")
      : t("modal_title_create_file");
  };

  const getTargetPaths = () => {
    if (
      selectedPaths &&
      selectedPaths.size > 1 &&
      selectedPaths.has(activeModal.path)
    ) {
      return Array.from(selectedPaths);
    }
    return [activeModal.path];
  };

  return (
    <Modal
      isOpen={!!activeModal}
      onClose={() => setActiveModal(null)}
      title={getTitle()}
    >
      <div className="modal-body">
        {isLayoutMode ? (
          <LayoutModal
            paths={getTargetPaths()}
            modalInput={modalInput}
            setModalInput={setModalInput}
            layoutList={layoutsList || []}
            onUpdateLayout={onUpdateLayout}
            onClose={() => setActiveModal(null)}
          />
        ) : isDeleteMode ? (
          <DeleteConfirmModal
            path={activeModal.path}
            onClose={() => setActiveModal(null)}
          />
        ) : isBuildStatusMode ? (
          <BuildStatusModal
            result={activeModal.result}
            onClose={() => setActiveModal(null)}
          />
        ) : (
          <CreateModal type={activeModal.type} path={activeModal.path} />
        )}
      </div>
    </Modal>
  );
}
