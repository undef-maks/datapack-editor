import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import "./EditorToolbar.css";

export default function EditorToolbar({ onGoHome, onOpenSettings }) {
  return (
    <div className="editor-toolbar">
      <button className="toolbar-btn" onClick={onGoHome} title="Dashboard">
        <IoHomeOutline />
      </button>
      <button className="toolbar-btn" onClick={onOpenSettings} title="Settings">
        <IoSettingsOutline />
      </button>
    </div>
  );
}
