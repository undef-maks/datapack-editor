import { VscSave, VscCheck, VscSaveAs } from "react-icons/vsc";
import "./EditorHeader.css";

export default function EditorHeader({ activeFile, onSave, isDirty }) {
  return (
    <div className="panel-header">
      <span className="file-path">
        Editing: {activeFile} {isDirty && "*"}
      </span>
      <button
        className={`save-button ${!isDirty ? "saved" : ""}`}
        onClick={onSave}
        disabled={!isDirty}
      >
        {isDirty ? <VscSave /> : <VscCheck />}
        <span>{isDirty ? "Не збережено" : "Збережено"}</span>
      </button>
    </div>
  );
}
