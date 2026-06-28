import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./JSONEditor.css";

export default function JSONEditor({ value, onChange, theme }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value || "");
    }
  }, [value]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument").run();
    });
  };

  return (
    <div className="json-editor-container">
      <Editor
        theme={theme === "light" ? "vs" : "vs-dark"}
        language="json"
        value={value || ""}
        onChange={onChange}
        onMount={handleEditorDidMount}
        loading={null}
        width="100%"
        options={{
          fontSize: 14,
          fontFamily: '"JetBrains Mono", monospace',
          minimap: { enabled: false },
          tabSize: 2,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12 },
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: false,
          quickSuggestions: true,
        }}
      />
    </div>
  );
}
