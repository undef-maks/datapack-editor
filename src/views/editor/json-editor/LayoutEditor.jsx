import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";

let isProviderRegistered = false;

export default function LayoutEditor({ value, onChange, filePath, onSave }) {
  useEffect(() => {
    loader.init().then((monaco) => {
      if (isProviderRegistered) return;
      monaco.languages.registerCompletionItemProvider("json", {
        triggerCharacters: ["$"],
        provideCompletionItems: (model, position) => {
          const text = model.getValue();
          const offset = model.getOffsetAt(position);

          const textBefore = text.substring(0, offset);
          const lastOpenBrace = textBefore.lastIndexOf("{");
          const lastStructure = textBefore.lastIndexOf('"json-structure"');

          if (lastStructure === -1 || lastStructure < lastOpenBrace) {
            return null;
          }

          const idRegex = /"id"\s*:\s*"([^"]+)"/g;
          const foundIds = new Set();
          let match;
          while ((match = idRegex.exec(text)) !== null) {
            foundIds.add(match[1]);
          }

          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: position.column,
          };

          return {
            suggestions: Array.from(foundIds).map((id) => ({
              label: `$form.${id}`,
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: `$form.${id}`,
              detail: `ID: ${id}`,
              range: range,
              filterText: `$form.${id}`,
              sortText: "0",
            })),
          };
        },
      });

      isProviderRegistered = true;
    });
  }, []);

  return (
    <Editor
      key={filePath}
      height="100%"
      width="100%"
      language="json"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      onMount={(editor, monaco) => {
        editor.onKeyDown((e) => {
          if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyS) {
            e.preventDefault();
            e.stopPropagation();
            if (onSave) onSave();
          }
        });
      }}
      options={{
        tabSize: 2,
        automaticLayout: true,
        suggestOnTriggerCharacters: false,
      }}
    />
  );
}
