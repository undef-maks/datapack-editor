import { useState, useCallback } from "react";
import { isModelFile } from "@utils/editorUtils";

export const useFileEditor = (fs) => {
  const [activeFile, setActiveFile] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileBlob, setFileBlob] = useState(null);
  const [originalContent, setOriginalContent] = useState("");
  const [currentLayout, setCurrentLayout] = useState(null);
  const [viewMode, setViewMode] = useState("form");
  const [selectedPaths, setSelectedPaths] = useState(new Set());
  const [lastSelectedPath, setLastSelectedPath] = useState(null);

  const isDirty = fileContent !== originalContent;

  const onFileOpen = useCallback(
    (path) => {
      setFileContent("");
      setFileBlob(null);
      setOriginalContent("");
      setCurrentLayout(null);
      setActiveFile(path);

      if (isModelFile(path)) {
        setViewMode("3d");
      }

      fs.handleOpenFile(
        path,
        () => {},
        (content, blob = null) => {
          if (blob) {
            setFileBlob(blob);
            setFileContent("");
            setOriginalContent("");
          } else {
            setFileContent(content);
            setOriginalContent(content);
          }
        },
        fs.layoutList,
        setCurrentLayout,
        setViewMode,
      );
    },
    [fs],
  );

  const handleNodeClick = useCallback(
    (e, node, flatNodes) => {
      if (node.type === "folder") {
        return;
      }

      const path = node.path;
      const newSelection = new Set(selectedPaths);

      if (e.shiftKey && lastSelectedPath) {
        const currentIndex = flatNodes.findIndex((n) => n.path === path);
        const lastIndex = flatNodes.findIndex(
          (n) => n.path === lastSelectedPath,
        );

        if (currentIndex !== -1 && lastIndex !== -1) {
          const start = Math.min(currentIndex, lastIndex);
          const end = Math.max(currentIndex, lastIndex);

          const rangeNodes = flatNodes
            .slice(start, end + 1)
            .filter((n) => n.type === "file");
          rangeNodes.forEach((n) => newSelection.add(n.path));
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (newSelection.has(path)) {
          newSelection.delete(path);
        } else {
          newSelection.add(path);
        }
        setLastSelectedPath(path);
      } else {
        newSelection.clear();
        newSelection.add(path);
        setLastSelectedPath(path);
        onFileOpen(path);
      }

      setSelectedPaths(newSelection);
    },
    [selectedPaths, lastSelectedPath, onFileOpen],
  );

  const handleMoveMultipleFiles = useCallback(
    async (pathsArray, targetFolderPath, handleRenameFile, setFileSystem) => {
      for (const sourcePath of pathsArray) {
        if (
          !sourcePath ||
          sourcePath === targetFolderPath ||
          targetFolderPath.startsWith(sourcePath + "/")
        ) {
          continue;
        }
        const name = sourcePath.split("/").pop();
        const newPath = targetFolderPath ? `${targetFolderPath}/${name}` : name;
        await handleRenameFile(sourcePath, newPath, setFileSystem);
      }
      setSelectedPaths(new Set());
      setLastSelectedPath(null);
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
    setLastSelectedPath(null);
  }, []);

  const onSave = useCallback(async () => {
    if (isDirty && activeFile) {
      await fs.handleSave(activeFile, fs.fileSystem, fileContent);
      setOriginalContent(fileContent);
    }
  }, [activeFile, fs, fileContent, isDirty]);

  return {
    activeFile,
    setActiveFile: onFileOpen,
    fileContent,
    setFileContent,
    fileBlob,
    currentLayout,
    viewMode,
    setViewMode,
    isDirty,
    onSave,
    layoutsList: fs.layoutList,
    selectedPaths,
    handleNodeClick,
    clearSelection,
    handleMoveMultipleFiles,
  };
};
