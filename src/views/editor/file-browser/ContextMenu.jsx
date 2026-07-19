import { useEffect } from "react";
import "./ContextMenu.css";

export default function ContextMenu({ x, y, onClose, onAction, node }) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  const isFolder = node?.type === "folder";
  const path = node?.path;

  const handleItemClick = (actionType) => {
    onAction(actionType, path);
    onClose();
  };

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {isFolder ? (
        <>
          <div onClick={() => handleItemClick("create-file")}>
            New File
          </div>
          <div onClick={() => handleItemClick("create-folder")}>
            New Folder
          </div>
          <div onClick={() => handleItemClick("create-todo-file")}>
            Create Todo List
          </div>
          <div onClick={() => handleItemClick("folder-migrate")}>
            Migrate
          </div>
        </>
      ) : (
        <>
          <div onClick={() => handleItemClick("layout")}>
            Change Layout
          </div>
          <div onClick={() => handleItemClick("migrate")}>
            Migrate
          </div>
        </>
      )}

      <div className="context-menu-separator" />

      <div onClick={() => handleItemClick("rename")}>
        Rename
      </div>
      <div
        className="context-menu-danger"
        onClick={() => handleItemClick("delete")}
      >
        Delete
      </div>
    </div>
  );
}
