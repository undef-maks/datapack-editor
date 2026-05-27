import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscAdd,
  VscNewFile,
  VscNewFolder,
  VscSymbolMethod,
  VscFiles,
} from "react-icons/vsc";
import "./FileBrowser.css";

function TreeNode({
  node,
  activeFile,
  setActiveFile,
  setActiveModal,
  setContextMenu,
  level = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const paddingLeft = `${level * 18 + 12}px`;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  if (node.type === "file") {
    return (
      <div
        className={`clickable ${activeFile === node.path ? "active-file" : ""}`}
        style={{ paddingLeft }}
        onClick={() => setActiveFile(node.path)}
        onContextMenu={handleContextMenu}
      >
        {node.hasLayout ? (
          <VscSymbolMethod
            style={{ marginRight: "8px", color: "#d97706", fontSize: "16px" }}
          />
        ) : (
          <VscFile
            style={{ marginRight: "8px", color: "#696974", fontSize: "16px" }}
          />
        )}
        <span>{node.name.split("/").pop()}</span>
      </div>
    );
  }

  return (
    <div className="tree-node-wrapper">
      <div
        className="clickable tree-folder"
        style={{ paddingLeft }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          {isOpen ? (
            <VscFolderOpened
              style={{ marginRight: "8px", color: "#d97706", fontSize: "16px" }}
            />
          ) : (
            <VscFolder
              style={{ marginRight: "8px", color: "#94949e", fontSize: "16px" }}
            />
          )}
          {node.name.split("/").pop()}
        </span>
        {isHovered && (
          <div className="folder-actions">
            <button
              title="New File"
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal({ type: "file", path: node.path });
              }}
            >
              <VscNewFile />
            </button>
            <button
              title="New Folder"
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal({ type: "folder", path: node.path });
              }}
            >
              <VscNewFolder />
            </button>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="folder-children">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              setActiveModal={setActiveModal}
              setContextMenu={setContextMenu}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileBrowser({
  fileSystem,
  activeFile,
  setActiveFile,
  setActiveModal,
  onDeleteFile,
  onChangeLayout,
}) {
  const { t } = useTranslation();
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const buildTree = (flatList) => {
    const root = { name: "root", type: "folder", children: [], path: "" };
    flatList.forEach((item) => {
      const parts = item.name.split("/");
      let current = root;
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            type: isLast && item.type === "file" ? "file" : "folder",
            path: item.name,
            children: [],
            hasLayout: item.hasLayout,
          };
          current.children.push(existing);
        }
        current = existing;
      });
    });
    return root.children;
  };

  return (
    <div className="editor-sidebar-panel">
      <div className="sidebar-header">
        <VscFiles style={{ marginRight: "8px", fontSize: "16px" }} />
        <span>{t("explorer_title", "Explorer")}</span>
      </div>
      <div className="sidebar-tree">
        {buildTree(fileSystem).map((node, index) => (
          <TreeNode
            key={index}
            node={node}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            setActiveModal={setActiveModal}
            setContextMenu={setContextMenu}
            level={0}
          />
        ))}
      </div>
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => onChangeLayout(contextMenu.node.path)}>
            {t("change_layout", "Змінити layout")}
          </button>
          <button onClick={() => onDeleteFile(contextMenu.node.path)}>
            {t("delete", "Видалити")}
          </button>
        </div>
      )}
    </div>
  );
}
