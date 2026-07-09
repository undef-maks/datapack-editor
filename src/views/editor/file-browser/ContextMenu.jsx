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

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {isFolder ? (
        <>
          <div
            onClick={() => {
              onAction("create-file", path);
              onClose();
            }}
          >
            New File
          </div>
          <div
            onClick={() => {
              onAction("create-folder", path);
              onClose();
            }}
          >
            New Folder
          </div>
          <div
            onClick={() => {
              onAction("folder-migrate", path);
              onClose();
            }}
          >
            Migrate
          </div>
        </>
      ) : (
        <>
          <div
            onClick={() => {
              onAction("layout", path);
              onClose();
            }}
          >
            Change Layout
          </div>
          <div
            onClick={() => {
              onAction("migrate", path);
              onClose();
            }}
          >
            Migrate
          </div>
        </>
      )}

      <div className="context-menu-separator" />

      <div
        onClick={() => {
          onAction("rename", path);
          onClose();
        }}
      >
        Rename
      </div>
      <div
        className="context-menu-danger"
        onClick={() => {
          onAction("delete", path);
          onClose();
        }}
      >
        Delete
      </div>
    </div>
  );
}
