import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FileBrowser from "./file-browser/FileBrowser";
import EditorHeader from "./editor-header/EditorHeader";
import EditorContent from "./editor-content/EditorContent";
import EditorModal from "./editor-modal/EditorModal";
import EditorToolbar from "./toolbar/EditorToolbar";
import SettingsModal from "../../components/settings/SettingsModal";
import { useFileSystem } from "../../hooks/useFileSystem";
import "./DatapackEditor.css";

export default function DatapackEditor({
  setView,
  directoryHandle,
  settings,
  setSettings,
}) {
  const { t } = useTranslation();
  const {
    fileSystem,
    setFileSystem,
    layoutList,
    getDirHandleFromPath,
    handleOpenFile,
    handleSave,
    handleCreateFile,
    handleCreateFolder,
    handleUpdateLayout,
  } = useFileSystem(directoryHandle);

  const [activeFile, setActiveFile] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [modalInput, setModalInput] = useState("");
  const [currentLayout, setCurrentLayout] = useState(null);
  const [viewMode, setViewMode] = useState("form");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isDirty = fileContent !== originalContent;

  const onFileOpen = (path) => {
    handleOpenFile(
      path,
      (p) => setActiveFile(p),
      (content) => {
        setFileContent(content);
        setOriginalContent(content);
      },
      layoutList,
      setCurrentLayout,
      setViewMode,
    );
  };

  const onSave = useCallback(async () => {
    if (isDirty && activeFile) {
      await handleSave(activeFile, fileSystem, fileContent);
      setOriginalContent(fileContent);
    }
  }, [activeFile, fileSystem, fileContent, isDirty, handleSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave]);

  return (
    <div className="editor-layout">
      <div className="editor-sidebar-container">
        <EditorToolbar
          onGoHome={() => setView("dashboard")}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <FileBrowser
          fileSystem={fileSystem}
          activeFile={activeFile}
          setActiveFile={onFileOpen}
          setActiveModal={setActiveModal}
          onDeleteFile={async (p) => {
            const dirHandle = await getDirHandleFromPath(
              p.split("/").slice(0, -1).join("/"),
            );
            await dirHandle.removeEntry(p.split("/").pop());
            setFileSystem((prev) => prev.filter((f) => f.name !== p));
          }}
          onChangeLayout={(path) => setActiveModal({ type: "layout", path })}
        />
      </div>

      <div className="editor-main-panel">
        <EditorHeader
          activeFile={activeFile}
          onSave={onSave}
          isDirty={isDirty}
        />

        {currentLayout && (
          <div className="panel-tabs">
            <button
              className={viewMode === "form" ? "active" : ""}
              onClick={() => setViewMode("form")}
            >
              {t("tab_form")}
            </button>
            <button
              className={viewMode === "json" ? "active" : ""}
              onClick={() => setViewMode("json")}
            >
              {t("tab_json")}
            </button>
          </div>
        )}

        <div className="panel-body">
          <EditorContent
            viewMode={viewMode}
            currentLayout={currentLayout}
            fileContent={fileContent}
            setFileContent={setFileContent}
          />
        </div>
      </div>

      <EditorModal
        activeModal={activeModal}
        modalInput={modalInput}
        layoutList={layoutList}
        setModalInput={setModalInput}
        activeFile={activeModal?.path}
        onClose={() => {
          setActiveModal(null);
          setModalInput("");
        }}
        onCreate={(n, p, l) => {
          if (activeModal.type === "folder") {
            handleCreateFolder(
              n,
              p,
              setFileSystem,
              setActiveModal,
              setModalInput,
            );
          } else {
            handleCreateFile(
              n,
              p,
              l,
              setFileSystem,
              setActiveModal,
              setModalInput,
            );
          }
        }}
        onUpdateLayout={(p, l) =>
          handleUpdateLayout(
            p,
            l,
            fileSystem,
            setFileSystem,
            setActiveModal,
            setModalInput,
            (path) => onFileOpen(path),
          )
        }
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}
