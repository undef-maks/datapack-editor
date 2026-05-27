import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

export default function JSONEditor({ value, onChange, theme }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    if (monacoRef.current) {
      const themeMap = {
        light: "custom-light",
        dark: "custom-dark",
        amoled: "custom-amoled",
      };
      monacoRef.current.editor.setTheme(themeMap[theme] || "custom-dark");
    }
  }, [theme]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.register({ id: "my-json" });

    monaco.languages.setMonarchTokensProvider("my-json", {
      tokenizer: {
        root: [
          [/"(\$\{ui\.[^}]+\}|\$ui\.[a-zA-Z0-9_]+)"/, "custom-ui"],
          [
            /"(\$\{structure\.[^}]+\}|\$structure\.[a-zA-Z0-9_]+)"/,
            "custom-structure",
          ],
          [/"/, "string", "@string"],
          [/[{}()\[\]]/, "@brackets"],
          [/:/, "delimiter"],
          [/,/, "delimiter"],
          [/\d+/, "number"],
          [/\b(true|false|null)\b/, "keyword"],
        ],
        string: [
          [/[^\\"]+/, "string"],
          [/\\./, "string.escape"],
          [/"/, "string", "@pop"],
        ],
      },
    });

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "custom-ui", foreground: "f472b6", fontStyle: "bold" },
        { token: "custom-structure", foreground: "3b82f6", fontStyle: "bold" },
        { token: "string", foreground: "10b981" },
        { token: "number", foreground: "f59e0b" },
        { token: "keyword", foreground: "8b5cf6" },
        { token: "delimiter", foreground: "e3e3e6" },
      ],
      colors: {
        "editor.background": "#141416",
        "editor.foreground": "#e3e3e6",
        "editorLineNumber.foreground": "#4f4f5a",
      },
    });

    monaco.editor.setTheme("custom-dark");
  };

  return (
    <div style={{ height: "100%", width: "100%", background: "#141416" }}>
      <Editor
        height="100%"
        theme="custom-dark"
        defaultLanguage="my-json"
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 13,
          fontFamily: '"JetBrains Mono", monospace',
          minimap: { enabled: false },
          tabSize: 2,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12 },
          wordWrap: "on",
        }}
      />
    </div>
  );
}
