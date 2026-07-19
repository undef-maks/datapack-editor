import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VscFiles, VscSearch } from "react-icons/vsc";
import { useEditor } from "@context/EditorContext";
import { useTreeBuilder } from "@hooks/useTreeBuilder";
import TreeNode from "./TreeNode";
import ContextMenu from "./ContextMenu";

export default function FileBrowser({ width, setWidth }) {
  const { t } = useTranslation();
  const {
    fileSystem,
    setFileSystem,
    setModal,
    setRenamingNodePath,
    handleUploadEntries,
    handleRenameFile,
    setFocusedNode,
    setCreatingNodePath,
    setCreatingNodeType,
    selectedPaths,
  } = useEditor();

  const treeData = useTreeBuilder(fileSystem);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [menu, setMenu] = useState({ x: 0, y: 0, visible: false, node: null });
  const panelRef = useRef(null);
  const dragCounter = useRef(0);
  const isResizing = useRef(false);

  const startResizing = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    if (e.clientX > 150 && e.clientX < 800) setWidth(e.clientX);
  };

  const handleContextMenu = (e, node) => {
    setMenu({ x: e.clientX, y: e.clientY, visible: true, node });
  };

  const handleMenuAction = (action, path) => {
    if (action === "delete") setModal({ type: "delete", path });
    if (action === "rename") setRenamingNodePath(path);
    if (action === "layout") setModal({ type: "layout", path });

    if (action === "migrate") {
      const filesToMigrate = selectedPaths.has(path)
        ? Array.from(selectedPaths)
        : [path];
      setModal({ type: "migration-picker", paths: filesToMigrate });
    }

    if (action === "folder-migrate") {
      const filesInFolder = fileSystem
        .filter((f) =>
          f.type === "file" &&
          f.name.startsWith(path + "/") &&
          f.name.endsWith(".json")
        )
        .map((f) => f.name);

      if (filesInFolder.length > 0) {
        setModal({ type: "migration-picker", paths: filesInFolder });
      }
    }

    if (action === "create-file" || action === "create-folder" || action === "create-todo-file") {
      const type = action === "create-folder" ? "folder" : "file";
      if (menu.node) {
        setCreatingNodePath(path);

        if (action === "create-todo-file") {
          window.__isTodoCreation = true;
          setCreatingNodeType("file");
        } else {
          window.__isTodoCreation = false;
          setCreatingNodeType(type);
        }

        setFocusedNode(menu.node);
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (
      window.__draggedNodePath ||
      window.__draggedNodesPaths ||
      e.dataTransfer.types.includes("Files")
    ) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    const { handleMoveMultipleFiles } = useEditor();
    const targetPath = "";
    let sourcePaths = window.__draggedNodesPaths;
    if (sourcePaths && sourcePaths.length > 0) {
      await handleMoveMultipleFiles(
        sourcePaths,
        targetPath,
        handleRenameFile,
        setFileSystem,
      );
    } else {
      const internalPath =
        window.__draggedNodePath ||
        e.dataTransfer.getData("application/x-internal-path");
      if (internalPath) {
        const name = internalPath.split("/").pop();
        await handleRenameFile(internalPath, name, setFileSystem);
      } else if (e.dataTransfer.items) {
        await handleUploadEntries(e.dataTransfer.items, "");
      }
    }
    window.__draggedNodesPaths = null;
    window.__draggedNodePath = null;
  };

  return (
    <div
      className={`editor-sidebar-panel ${isDragOver ? "drag-root-active" : ""}`}
      ref={panelRef}
      style={{
        width: "100%",
        height: "100%",
        outline: isFocused ? "1px solid #4a9eff" : "none",
      }}
      onClick={() => setIsFocused(true)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="sidebar-resizer" onMouseDown={startResizing} />
      <div className="sidebar-header">
        <VscFiles style={{ marginRight: "8px" }} />
        <span>{t("explorer_title", "Explorer")}</span>
        <button
          className="search-btn"
          onClick={(e) => {
            e.stopPropagation();
            setModal({ type: "search" });
          }}
          title={t("search_tooltip", "Search files")}
        >
          <VscSearch />
        </button>
      </div>
      <div className="sidebar-tree">
        {[...treeData]
          .filter((node) => !node.name.split("/").pop().startsWith("."))
          .sort((a, b) =>
            a.type === b.type
              ? a.name.localeCompare(b.name)
              : a.type === "folder"
                ? -1
                : 1,
          )
          .map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              selectedPaths={selectedPaths}
              onContextMenu={handleContextMenu}
            />
          ))}
      </div>
      {menu.visible && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          node={menu.node}
          onClose={() => setMenu({ ...menu, visible: false })}
          onAction={handleMenuAction}
        />
      )}
    </div>
  );
}
