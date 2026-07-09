import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./JSONEditor.css";

export default function JSONEditor({ value, onChange, theme }) {
  const editorRef = useRef(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const lastValueRef = useRef(value || "");

  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      lastValueRef.current = value || "";

      const model = editorRef.current.getModel();
      if (model) {
        editorRef.current.executeEdits("remote-update", [{
          range: model.getFullModelRange(),
          text: value || "",
          forceMoveMarkers: false
        }]);
      }
    }
  }, [value]);

  const handleEditorChange = (newValue) => {
    const text = newValue || "";
    lastValueRef.current = text;
    if (onChangeRef.current) {
      onChangeRef.current(text);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

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
        defaultValue={value || ""}
        onChange={handleEditorChange}
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
          formatOnType: false,
        }}
      />
    </div>
  );
}
