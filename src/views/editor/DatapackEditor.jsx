import { useState, useMemo } from "react";
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
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [isBuilding, setIsBuilding] = useState(false);

  const flattenNodes = (nodes) => {
    let list = [];
    nodes.forEach((n) => {
      list.push(n);
      if (n.children) list = list.concat(flattenNodes(n.children));
    });
    return list;
  };

  const flatNodesList = useMemo(
    () => flattenNodes(fs.fileSystem || []),
    [fs.fileSystem],
  );

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

    if (isBuilding) return;

    try {
      setIsBuilding(true);
      const buildHandle = await directoryHandle.getDirectoryHandle("build", {
        create: true,
      });
      const srcHandle = await directoryHandle.getDirectoryHandle("src");
      const compiler = new DatapackCompiler(srcHandle, buildHandle);
      const result = await compiler.build();
      if (fs.refreshDirectory) await fs.refreshDirectory();
      modal.setModal({ type: "build-status", result: result });
    } catch (err) {
      modal.setModal({
        type: "build-status",
        result: { success: false, error: err.message },
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const onUpdateLayout = async (filePath, selectedLayoutId) => {
    const layoutsList = editor.layoutsList || [];
    const currentLayout = layoutsList.find((l) => l.id === selectedLayoutId);
    if (!currentLayout) return;

    const entry = fs.fileSystem.find((f) => f.name === filePath);
    if (!entry || !entry.handle) return;

    const file = await entry.handle.getFile();
    const oldContent = await file.text();
    const oldJson = JSON.parse(oldContent);

    const newLayoutData = generateInitialJson(currentLayout, selectedLayoutId);

    const updatedJson = { ...oldJson };

    Object.keys(newLayoutData).forEach((key) => {
      if (key === "_meta") {
        updatedJson._meta = { ...oldJson._meta, ...newLayoutData._meta };
      } else if (
        oldJson[key] === undefined ||
        oldJson[key] === null ||
        oldJson[key] === ""
      ) {
        updatedJson[key] = newLayoutData[key];
      }
    });

    const jsonString = JSON.stringify(updatedJson, null, "\t");

    if (fs.handleSave) {
      await fs.handleSave(filePath, fs.fileSystem, jsonString);
      fs.setFileSystem((prev) =>
        prev.map((f) => (f.name === filePath ? { ...f, hasLayout: true } : f)),
      );
      if (editor.activeFile === filePath) editor.setFileContent(jsonString);
    }
    modal.setModal(null);
  };

  const expandPath = (path) => {
    const parts = path.split("/");
    let current = "";
    let newSet = new Set();
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      newSet.add(current);
    }
    setExpandedPaths(newSet);
  };

  const contextValue = {
    ...fs,
    ...editor,
    ...modal,
    setFileSystem: fs.setFileSystem,
    onUpdateLayout,
    expandedPaths,
    expandPath,
    flatNodesList,
  };

  return (
    <EditorProvider value={contextValue}>
      <div className="editor-layout">
        <div
          className="editor-sidebar-container"
          style={{ width: `${sidebarWidth}px` }}
        >
          <EditorToolbar
            onGoHome={() => setView("dashboard")}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <FileBrowser width={sidebarWidth} setWidth={setSidebarWidth} />
        </div>
        <div className="editor-main-panel">
          <EditorHeader
            activeFile={editor.activeFile}
            onSave={editor.onSave}
            onBuild={handleBuild}
            isDirty={editor.isDirty}
            fileContent={editor.fileContent}
            layoutsList={editor.layoutsList}
            isBuilding={isBuilding}
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
              onSave={editor.onSave}
              migrationList={fs.migrationList}
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
