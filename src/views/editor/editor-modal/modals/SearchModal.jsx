import { useState, useMemo } from "react";
import { useEditor } from "@context/EditorContext";
import { VscFile, VscFolder, VscSearch } from "react-icons/vsc";
import "./styles/SearchModal.css";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const { setFocusedNode, expandPath, flatNodesList, handleNodeClick } =
    useEditor();

  const filtered = useMemo(() => {
    if (!flatNodesList) return [];

    if (query.length <= 1) return [];

    let results = flatNodesList.filter((n) => {
      if (n.name.startsWith("build")) return false;

      return n.name.toLowerCase().includes(query.toLowerCase());
    });

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [query, flatNodesList]);
  const handleSelect = (node) => {
    expandPath(node.name);
    setFocusedNode(node);

    if (node.type === "file") {
      const nodeForFileSystem = { ...node, path: node.name };

      handleNodeClick(
        { shiftKey: false },
        nodeForFileSystem,
        flatNodesList || [],
      );
    }

    onClose();
  };

  return (
    <div className="search-modal">
      <div className="search-input-wrapper">
        <VscSearch className="search-icon" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук файлів та папок..."
        />
      </div>
      <div className="search-results">
        {filtered.map((node) => {
          const fullPath = node.name || "";
          const lastSlashIndex = fullPath.lastIndexOf("/");
          const fileName =
            lastSlashIndex !== -1
              ? fullPath.substring(lastSlashIndex + 1)
              : fullPath;
          const parentPath =
            lastSlashIndex !== -1 ? fullPath.substring(0, lastSlashIndex) : "";

          return (
            <div
              key={node.name}
              className="result-item"
              onClick={() => handleSelect(node)}
            >
              <div className="result-main">
                {node.type === "folder" ? (
                  <VscFolder className="item-icon folder-icon" />
                ) : (
                  <VscFile className="item-icon file-icon" />
                )}
                <div className="result-info">
                  <span className="file-name">{fileName}</span>
                  {parentPath && (
                    <span className="file-path">{parentPath}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
