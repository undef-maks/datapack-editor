import React, { useEffect, useMemo } from "react";
import JSONEditor from "../json-editor/JSONEditor";
import LayoutEditor from "../json-editor/LayoutEditor";
import DynamicForm from "../dynamic-form/DynamicForm";
import ImageViewer from "./../image-viewer/ImageViewer";
import ModelViewer from "./model-viewer/ModelViewer";
import EditorTabs from "./EditorTabs";
import { MigrationEditor } from "../migrations-editor/MigrationEditor";
import { isModelFile, isImageFile, getFileLayoutId } from "@utils/editorUtils";
import "./EditorContent.css";

export default function EditorContent({
  viewMode,
  setViewMode,
  currentLayout,
  filePath,
  fileContent,
  fileBlob,
  setFileContent,
  onSave,
  migrationList,
}) {
  const isImage = useMemo(() => isImageFile(filePath), [filePath]);
  const is3DModel = useMemo(() => isModelFile(filePath), [filePath]);
  const isLayoutFile = useMemo(
    () => filePath?.startsWith("layouts/"),
    [filePath],
  );
  const currentMigration = useMemo(
    () => migrationList?.find((m) => m.path === filePath),
    [filePath, migrationList],
  );

  const fileLayoutId = getFileLayoutId(fileContent);
  const isLayoutLoading =
    fileLayoutId && (!currentLayout || currentLayout.id !== fileLayoutId);

  const renderContent = () => {
    if (isImage) return <ImageViewer filePath={filePath} fileBlob={fileBlob} />;
    if (is3DModel)
      return <ModelViewer filePath={filePath} fileBlob={fileBlob} />;
    if (isLayoutFile)
      return (
        <LayoutEditor
          key={filePath}
          value={fileContent}
          onChange={setFileContent}
          onSave={onSave}
        />
      );

    if (viewMode === "migration" && currentMigration) {
      return (
        <MigrationEditor
          key={filePath}
          activeFile={filePath}
          fileContent={fileContent}
          migrationConfig={currentMigration}
          onSave={onSave}
          onChange={setFileContent}
        />
      );
    }

    if (viewMode === "form" && currentLayout && !isLayoutLoading) {
      return (
        <DynamicForm
          structure={currentLayout["json-structure"] || {}}
          uiSchema={currentLayout["ui-form"] || {}}
          data={JSON.parse(fileContent || "{}")}
          onChange={(d) => setFileContent(JSON.stringify(d, null, 2))}
        />
      );
    }

    return (
      <JSONEditor
        key={filePath}
        value={fileContent}
        onChange={setFileContent}
      />
    );
  };

  const showModeToggle =
    !isImage && !is3DModel && (!!fileLayoutId || !!currentMigration);

  return (
    <div
      className="editor-content-wrapper"
      style={isLayoutLoading ? { opacity: 0.7 } : {}}
    >
      {showModeToggle && (
        <EditorTabs
          viewMode={viewMode}
          setViewMode={setViewMode}
          isLayoutLoading={isLayoutLoading}
          isMigrationFile={!!currentMigration}
          onChange={setFileContent}
          key={filePath}
        />
      )}
      <div className="main-editor-area">{renderContent()}</div>
    </div>
  );
}
