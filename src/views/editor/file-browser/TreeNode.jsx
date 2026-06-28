import "./FileBrowser.css";
import { useState, useEffect } from "react";
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscNewFile,
  VscNewFolder,
  VscSymbolMethod,
  VscLayout,
  VscFileMedia,
  VscCode,
} from "react-icons/vsc";
import { useEditor } from "@context/EditorContext";

export default function TreeNode({ node, level = 0, onContextMenu }) {
  const {
    activeFile,
    handleCreateFile,
    handleCreateFolder,
    renamingNodePath,
    setRenamingNodePath,
    focusedNode,
    setActiveFile,
    setFocusedNode,
    setFileSystem,
    handleRenameFile,
    handleUploadEntries,
    creatingNodePath,
    setCreatingNodePath,
    creatingNodeType,
    setCreatingNodeType,
    selectedPaths,
    handleNodeClick,
    handleMoveMultipleFiles,
  } = useEditor();

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const isRenaming = renamingNodePath === node.path;
  const isCreatingHere = creatingNodePath === node.path;
  const isSelected = node.type === "file" && selectedPaths?.has(node.path);

  useEffect(() => {
    if (isRenaming) setTempName(node.name.split("/").pop());
  }, [isRenaming, node.name]);

  useEffect(() => {
    if (isCreatingHere) {
      setIsOpen(true);
    }
  }, [isCreatingHere]);

  const handleCreateSubmit = () => {
    if (tempName) {
      if (creatingNodeType === "file") {
        const newPath = node.path ? `${node.path}/${tempName}` : tempName;
        handleCreateFile(tempName, node.path, null, setFileSystem);
        setActiveFile(newPath);
      } else {
        handleCreateFolder(tempName, node.path, setFileSystem);
      }
    }
    setCreatingNodePath(null);
    setCreatingNodeType(null);
    setTempName("");
  };

  const handleRenameSubmit = () => {
    if (tempName && tempName !== node.name.split("/").pop()) {
      const pathParts = node.path.split("/");
      pathParts.pop();
      const basePath = pathParts.join("/");
      const newPath = basePath ? `${basePath}/${tempName}` : tempName;
      handleRenameFile(node.path, newPath, setFileSystem);
    }
    setRenamingNodePath(null);
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    let pathsToDrag = [];

    if (node.type === "file" && selectedPaths.has(node.path)) {
      pathsToDrag = Array.from(selectedPaths);
    } else {
      pathsToDrag = [node.path || node.name];
    }

    window.__draggedNodesPaths = pathsToDrag;
    e.dataTransfer.setData(
      "application/x-multiple-paths",
      JSON.stringify(pathsToDrag),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    if (node.type !== "folder") return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    if (node.type !== "folder") return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const targetPath = node.path || node.name;
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
      await handleMoveMultipleFiles(
        sourcePaths,
        targetPath,
        handleRenameFile,
        setFileSystem,
      );
      setIsOpen(true);
    } else {
      const singlePath =
        window.__draggedNodePath ||
        e.dataTransfer.getData("application/x-internal-path");
      if (singlePath) {
        if (
          singlePath !== targetPath &&
          !targetPath.startsWith(singlePath + "/")
        ) {
          const name = singlePath.split("/").pop();
          const newPath = `${targetPath}/${name}`;
          await handleRenameFile(singlePath, newPath, setFileSystem);
          setIsOpen(true);
        }
      } else if (e.dataTransfer.items) {
        await handleUploadEntries(e.dataTransfer.items, targetPath);
        setIsOpen(true);
      }
    }

    window.__draggedNodesPaths = null;
    window.__draggedNodePath = null;
  };

  const renderFileIcon = () => {
    if (node.hasLayout) {
      return (
        <VscSymbolMethod style={{ marginRight: "8px", color: "#d97706" }} />
      );
    }

    const ext = node.name.split(".").pop().toLowerCase();
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "ico", "svg"];

    if (imageExtensions.includes(ext)) {
      return <VscFileMedia style={{ marginRight: "8px", color: "#4ec9b0" }} />;
    }

    if (ext === "json") {
      return <VscCode style={{ marginRight: "8px", color: "#ddb87f" }} />;
    }

    return <VscFile style={{ marginRight: "8px", color: "#696974" }} />;
  };

  const nameDisplay = isRenaming ? (
    <input
      autoFocus
      value={tempName}
      onChange={(e) => setTempName(e.target.value)}
      onBlur={handleRenameSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleRenameSubmit();
        if (e.key === "Escape") setRenamingNodePath(null);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    node.name.split("/").pop()
  );

  const nodeProps = {
    className: `clickable ${activeFile === node.path ? "active-file" : ""} ${focusedNode?.path === node.path ? "focused-node" : ""} ${isDragOver ? "drag-target-active" : ""} ${isSelected ? "selected" : ""}`,
    style: { paddingLeft: `${level * 18 + 12}px` },
    draggable: !isRenaming,
    onDragStart: handleDragStart,
    onContextMenu: (e) => {
      e.preventDefault();
      onContextMenu(e, node);
    },
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  if (node.type === "file")
    return (
      <div
        {...nodeProps}
        onClick={(e) => {
          handleNodeClick(e, node, window.__flatNodesList || []);
          setFocusedNode(node);
        }}
      >
        {renderFileIcon()}
        {nameDisplay}
      </div>
    );

  const FolderIcon =
    node.name === "layouts" ? VscLayout : isOpen ? VscFolderOpened : VscFolder;

  return (
    <div className="tree-node-wrapper">
      <div
        {...nodeProps}
        className={`${nodeProps.className} tree-folder`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setFocusedNode(node);
        }}
      >
        <span style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <FolderIcon
            style={{
              marginRight: "8px",
              color:
                node.name === "layouts"
                  ? "#a855f7"
                  : isOpen
                    ? "#d97706"
                    : "#94949e",
            }}
          />
          {nameDisplay}
        </span>
        {isHovered && !isRenaming && (
          <div className="folder-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreatingNodePath(node.path);
                setCreatingNodeType("file");
                setTempName("");
              }}
            >
              <VscNewFile />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreatingNodePath(node.path);
                setCreatingNodeType("folder");
                setTempName("");
              }}
            >
              <VscNewFolder />
            </button>
          </div>
        )}
      </div>

      {isCreatingHere && (
        <div
          className="sidebar-create-box"
          style={{ paddingLeft: `${(level + 1) * 18 + 12}px` }}
        >
          <input
            autoFocus
            placeholder={
              creatingNodeType === "file" ? "Name.json" : "Folder..."
            }
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleCreateSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSubmit();
              if (e.key === "Escape") {
                setCreatingNodePath(null);
                setCreatingNodeType(null);
              }
            }}
          />
        </div>
      )}
      {isOpen &&
        [...node.children]
          .sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === "folder" ? -1 : 1;
          })
          .map((child, i) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onContextMenu={onContextMenu}
            />
          ))}
    </div>
  );
}
