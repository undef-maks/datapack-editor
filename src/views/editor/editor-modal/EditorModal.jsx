import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/Modal";
import LayoutModal from "./modals/LayoutModal";
import CreateModal from "./modals/CreateModal";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import BuildStatusModal from "./modals/BuildStatusModal";
import SearchModal from "./modals/SearchModal";
import MigrationModal from "./modals/MigrationModal";
import { useEditor } from "../../../context/EditorContext";
import { useEffect } from "react";
import { applyMigration } from "@utils/migrate";

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
    migrationList,
    handleSave,
    fileSystem,
    fs,
  } = useEditor();

  useEffect(() => {
    if (
      activeModal &&
      (activeModal.type === "layout" ||
        activeModal.type === "migration-picker") &&
      loadData
    ) {
      loadData();
    }
  }, [activeModal?.type]);

  if (!activeModal) return null;

  const isLayoutMode = activeModal.type === "layout";
  const isDeleteMode = activeModal.type === "delete";
  const isBuildStatusMode = activeModal.type === "build-status";
  const isSearchMode = activeModal.type === "search";
  const isMigrationMode = activeModal.type === "migration-picker";

  const getTitle = () => {
    if (isLayoutMode) return t("modal_title_change_layout");
    if (isDeleteMode) return t("modal_title_delete_confirm");
    if (isBuildStatusMode) return "Результат компіляції";
    if (isSearchMode) return "Пошук файлів";
    if (isMigrationMode) return "Застосувати міграцію";
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

  const handleApplyMigration = async (paths, migrationPath) => {
    const migrationFile = migrationList.find((m) => m.path === migrationPath);
    if (!migrationFile) return;

    const template = migrationFile.output_template;

    for (const filePath of paths) {
      const entry = fileSystem.find((f) => f.name === filePath);

      if (!entry || !entry.handle) {
        console.error("Не знайдено handle для:", filePath);
        continue;
      }

      const file = await entry.handle.getFile();
      const content = await file.text();
      const jsonData = JSON.parse(content);

      const migratedData = applyMigration(jsonData, template);

      await handleSave(
        filePath,
        fileSystem,
        JSON.stringify(migratedData, null, 2),
      );
    }
    setActiveModal(null);
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
        ) : isSearchMode ? (
          <SearchModal onClose={() => setActiveModal(null)} />
        ) : isMigrationMode ? (
          <MigrationModal
            paths={activeModal.paths}
            migrationList={migrationList || []}
            onApply={handleApplyMigration}
            onClose={() => setActiveModal(null)}
          />
        ) : (
          <CreateModal type={activeModal.type} path={activeModal.path} />
        )}
      </div>
    </Modal>
  );
}
