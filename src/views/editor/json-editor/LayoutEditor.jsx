import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";

let isProviderRegistered = false;

export default function LayoutEditor({ value, onChange, filePath }) {
  useEffect(() => {
    loader.init().then((monaco) => {
      if (isProviderRegistered) return;

      monaco.languages.registerCompletionItemProvider("json", {
        triggerCharacters: ["$"],
        provideCompletionItems: (model, position) => {
          const text = model.getValue();
          const offset = model.getOffsetAt(position);

          // 1. ПЕРЕВІРКА КОНТЕКСТУ (чи ми в json-structure)
          const textBefore = text.substring(0, offset);
          const lastOpenBrace = textBefore.lastIndexOf("{");
          const lastStructure = textBefore.lastIndexOf('"json-structure"');

          if (lastStructure === -1 || lastStructure < lastOpenBrace) {
            return null; // В інших блоках не даємо НІЧОГО, Monaco сам розбереться
          }

          // 2. ЗБІР ID
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
              detail: `Змінна з форми (ID: ${id})`,
              range: range,
              // ВАЖЛИВО: filterText допоможе Monaco зрозуміти, що це унікальна підказка
              filterText: `$form.${id}`,
              sortText: "0", // Ставимо на самий верх
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
      options={{
        tabSize: 2,
        automaticLayout: true,
        // Вимикаємо авто-тригери, щоб Monaco не "угадував" зайве
        suggestOnTriggerCharacters: false,
      }}
    />
  );
}
