import React, { useMemo } from "react";
import JSONEditor from "../json-editor/JSONEditor";
import DynamicForm from "../dynamic-form/DynamicForm";

export default function EditorContent({
  viewMode,
  currentLayout,
  fileContent,
  setFileContent,
}) {
  const data = useMemo(() => {
    try {
      return fileContent ? JSON.parse(fileContent) : {};
    } catch (e) {
      console.error("Помилка парсингу JSON", e);
      return {};
    }
  }, [fileContent]);

  const handleDataChange = (newData) => {
    setFileContent(JSON.stringify(newData, null, 2));
  };

  if (viewMode === "form" && currentLayout) {
    return (
      <DynamicForm
        structure={currentLayout.structure || {}}
        uiSchema={currentLayout["ui-schema"] || {}}
        data={data}
        onChange={handleDataChange}
      />
    );
  }

  return (
    <JSONEditor value={fileContent} onChange={(val) => setFileContent(val)} />
  );
}
