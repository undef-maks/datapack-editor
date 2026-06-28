import { useState } from "react";
import { EditorProvider } from "../../context/EditorContext";
import FileBrowser from "./file-browser/FileBrowser";
import EditorHeader from "./editor-header/EditorHeader";
import EditorContent from "./editor-content/EditorContent";
import EditorModal from "./editor-modal/EditorModal";
import EditorToolbar from "./toolbar/EditorToolbar";
import SettingsModal from "../../components/settings/SettingsModal";
import { useFileSystem } from "@hooks/useFileSystem";
import { useFileEditor } from "@hooks/useFileEditor";
import { useEditorModal } from "@hooks/useEditorModal";
import { generateInitialJson } from "../../utils/layoutEngine";
import { DatapackCompiler } from "@utils/compiler";
import "./DatapackEditor.css";

export default function DatapackEditor({
  setView,
  directoryHandle,
  settings,
  setSettings,
}) {
  const fs = useFileSystem(directoryHandle);
  const editor = useFileEditor(fs);
  const modal = useEditorModal();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleBuild = async () => {
    if (!directoryHandle) {
      modal.setModal({
        type: "build-status",
        result: {
          success: false,
          error: "Кореневу директорію проєкту не знайдено.",
        },
      });
      return;
    }

    try {
      window.__isCompiling = true;

      const buildHandle = await directoryHandle.getDirectoryHandle("build", {
        create: true,
      });

      const srcHandle = await directoryHandle.getDirectoryHandle("src");

      const compiler = new DatapackCompiler(srcHandle, buildHandle);
      const result = await compiler.build();

      window.__isCompiling = false;

      if (fs.refreshDirectory) {
        await fs.refreshDirectory();
      }

      modal.setModal({
        type: "build-status",
        result: result,
      });
    } catch (err) {
      window.__isCompiling = false;
      console.error(err);
      modal.setModal({
        type: "build-status",
        result: { success: false, error: err.message },
      });
    }
  };
  const onUpdateLayout = async (filePath, selectedLayoutId) => {
    const layoutsList = editor.layoutsList || [];
    const currentLayout = layoutsList.find((l) => l.id === selectedLayoutId);
    if (!currentLayout) return;

    const initialData = generateInitialJson(currentLayout, selectedLayoutId);
    const jsonString = JSON.stringify(initialData, null, "\t");

    if (fs.handleSave) {
      await fs.handleSave(filePath, fs.fileSystem, jsonString);

      fs.setFileSystem((prev) =>
        prev.map((f) => (f.name === filePath ? { ...f, hasLayout: true } : f)),
      );

      if (editor.activeFile === filePath) {
        editor.setFileContent(jsonString);
      }
    }

    modal.setModal(null);
  };

  const contextValue = {
    ...fs,
    ...editor,
    ...modal,
    setFileSystem: fs.setFileSystem,
    onUpdateLayout,
  };

  return (
    <EditorProvider value={contextValue}>
      <div className="editor-layout">
        <div className="editor-sidebar-container">
          <EditorToolbar
            onGoHome={() => setView("dashboard")}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <FileBrowser />
        </div>
        <div className="editor-main-panel">
          <EditorHeader
            activeFile={editor.activeFile}
            onSave={editor.onSave}
            onBuild={handleBuild}
            isDirty={editor.isDirty}
            fileContent={editor.fileContent}
            layoutsList={editor.layoutsList}
          />

          <div className="panel-body">
            <EditorContent
              viewMode={editor.viewMode}
              setViewMode={editor.setViewMode}
              currentLayout={editor.currentLayout}
              filePath={editor.activeFile}
              fileContent={editor.fileContent}
              fileBlob={editor.fileBlob}
              setFileContent={editor.setFileContent}
            />
          </div>
        </div>
        <EditorModal />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          setSettings={setSettings}
        />
      </div>
    </EditorProvider>
  );
}
