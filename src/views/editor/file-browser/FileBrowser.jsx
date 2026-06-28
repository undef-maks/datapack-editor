import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VscFiles } from "react-icons/vsc";
import { useEditor } from "@context/EditorContext";
import { useTreeBuilder } from "@hooks/useTreeBuilder";
import TreeNode from "./TreeNode";
import ContextMenu from "./ContextMenu";

export default function FileBrowser() {
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
    handleNodeClick,
  } = useEditor();

  const treeData = useTreeBuilder(fileSystem);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [menu, setMenu] = useState({ x: 0, y: 0, visible: false, node: null });
  const panelRef = useRef(null);
  const dragCounter = useRef(0);

  const getFlatNodes = (nodes) => {
    let flat = [];
    nodes.forEach((node) => {
      flat.push(node);
      if (node.children) {
        flat = flat.concat(getFlatNodes(node.children));
      }
    });
    return flat;
  };

  window.__flatNodesList = getFlatNodes(treeData);

  const handleContextMenu = (e, node) => {
    setMenu({ x: e.clientX, y: e.clientY, visible: true, node });
  };

  const handleMenuAction = (action, path) => {
    if (action === "delete") setModal({ type: "delete", path });
    if (action === "rename") setRenamingNodePath(path);
    if (action === "layout") setModal({ type: "layout", path });

    if (action === "create-file" || action === "create-folder") {
      const type = action === "create-file" ? "file" : "folder";
      if (menu.node) {
        setCreatingNodePath(path);
        setCreatingNodeType(type);
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
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const targetPath = "";
    let sourcePaths = window.__draggedNodesPaths;

    if (!sourcePaths) {
      const rawData = e.dataTransfer.getData("application/x-multiple-paths");
      if (rawData) {
        try {
          sourcePaths = JSON.parse(rawData);
        } catch (err) {}
      }
    }

    if (sourcePaths && sourcePaths.length > 0) {
      const { handleMoveMultipleFiles } = useEditor();
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
        if (internalPath.includes("/")) {
          const name = internalPath.split("/").pop();
          await handleRenameFile(internalPath, name, setFileSystem);
        }
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
      onClick={() => setIsFocused(true)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ outline: isFocused ? "1px solid #4a9eff" : "none" }}
    >
      <div className="sidebar-header">
        <VscFiles style={{ marginRight: "8px" }} />
        <span>{t("explorer_title", "Explorer")}</span>
      </div>
      <div className="sidebar-tree">
        {[...treeData]
          .sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === "folder" ? -1 : 1;
          })
          .map((node, i) => (
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
