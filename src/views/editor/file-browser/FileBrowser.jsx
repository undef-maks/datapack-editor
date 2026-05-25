import { useState } from "react";
import "./FileBrowser.css";

function TreeNode({ node, activeFile, setActiveFile, level = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const paddingLeft = `${level * 12 + 10}px`;

  if (node.type === "file") {
    const isActive = activeFile === node.path;
    return (
      <div
        className={`tree-file clickable ${isActive ? "active-file" : ""}`}
        style={{ paddingLeft }}
        onClick={() => setActiveFile(node.path)}
      >
        📄 {node.name}
      </div>
    );
  }

  return (
    <>
      <div
        className="tree-folder clickable"
        style={{ paddingLeft }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "📂" : "📁"} {node.name}
      </div>

      {isOpen && node.children && (
        <div className="folder-children">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function FileBrowser({
  fileSystem,
  activeFile,
  setActiveFile,
  setActiveModal,
}) {
  const buildTree = (flatList) => {
    const root = { name: "root", type: "folder", children: [] };

    flatList.forEach((item) => {
      const parts = item.name.split("/");
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        let existing = current.children.find((child) => child.name === part);

        if (!existing) {
          existing = {
            name: part,
            type: isLast && item.type === "file" ? "file" : "folder",
            path: item.name,
            children: [],
          };
          current.children.push(existing);
        }
        current = existing;
      });
    });

    const sortNodes = (nodes) => {
      return nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
      });
    };

    const recursiveSort = (node) => {
      if (node.children && node.children.length > 0) {
        node.children = sortNodes(node.children);
        node.children.forEach(recursiveSort);
      }
    };

    recursiveSort(root);
    return root.children;
  };

  const treeData = buildTree(fileSystem);

  return (
    <div className="editor-sidebar-panel">
      <div className="sidebar-header">
        <span>📁 FileBrowser</span>
        <div>
          <button onClick={() => setActiveModal("file")}>+</button>
          <button onClick={() => setActiveModal("dir")}>📂</button>
        </div>
      </div>

      <div className="sidebar-tree">
        {treeData.map((node, index) => (
          <TreeNode
            key={index}
            node={node}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
