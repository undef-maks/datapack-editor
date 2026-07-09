import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

export const MigrationEditor = ({ fileContent, onChange, onSave }) => {
  const [data, setData] = useState({ source: "", output: "" });
  const editorRefs = useRef({ source: null, output: null });

  useEffect(() => {
    try {
      const parsed = JSON.parse(fileContent);
      setData({
        source: JSON.stringify(parsed.source_template || {}, null, 2),
        output: JSON.stringify(parsed.output_template || {}, null, 2),
      });
    } catch (e) {
      console.error("Invalid migration file format");
    }
  }, [fileContent]);

  const updateParent = (sourceVal, outputVal) => {
    try {
      const newObj = {
        source_template: JSON.parse(sourceVal || "{}"),
        output_template: JSON.parse(outputVal || "{}"),
      };

      const newContent = JSON.stringify(newObj, null, 2);

      if (newContent !== fileContent) {
        onChange(newContent);
      }
    } catch (e) {}
  };

  const handleMount = (editor, type) => {
    editorRefs.current[type] = editor;
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
      () => {
        onSave();
      },
    );
  };

  const handleEditorChange = (value, type) => {
    setData((prev) => {
      const next = { ...prev, [type]: value };
      updateParent(next.source, next.output);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", height: "100%", gap: "10px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h4>Source</h4>
        <Editor
          height="90%"
          language="json"
          theme="vs-dark"
          value={data.source}
          onMount={(e) => handleMount(e, "source")}
          onChange={(val) => handleEditorChange(val, "source")}
          options={{ minimap: { enabled: false }, formatOnPaste: true }}
        />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h4>Output</h4>
        <Editor
          height="90%"
          language="json"
          theme="vs-dark"
          value={data.output}
          onMount={(e) => handleMount(e, "output")}
          onChange={(val) => handleEditorChange(val, "output")}
          options={{ minimap: { enabled: false }, formatOnPaste: true }}
        />
      </div>
    </div>
  );
};
