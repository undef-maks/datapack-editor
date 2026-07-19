import React, { useEffect, useMemo, useState } from "react";
import JSONEditor from "../json-editor/JSONEditor";
import LayoutEditor from "../json-editor/LayoutEditor";
import DynamicForm from "../dynamic-form/DynamicForm";
import ImageViewer from "./../image-viewer/ImageViewer";
import ModelViewer from "./model-viewer/ModelViewer";
import TodoEditor from "../todo-editor/TodoEditor";
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
  const [loadedPath, setLoadedPath] = useState(null);

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

  useEffect(() => {
    if (filePath) {
      if (isImage || is3DModel) {
        if (fileBlob) setLoadedPath(filePath);
      } else {
        if (fileContent !== undefined && fileContent !== null) {
          setLoadedPath(filePath);
        }
      }
    }
  }, [filePath, fileContent, fileBlob, isImage, is3DModel]);

  useEffect(() => {
    setLoadedPath(null);
  }, [filePath]);

  const parsedJson = useMemo(() => {
    if (isImage || is3DModel || !fileContent || loadedPath !== filePath) return null;
    try {
      return JSON.parse(fileContent);
    } catch (e) {
      return null;
    }
  }, [fileContent, isImage, is3DModel, loadedPath, filePath]);

  const isTodoFile = useMemo(() => {
    return parsedJson?._meta?.file_type === "todo";
  }, [parsedJson]);

  useEffect(() => {
    if (isTodoFile && viewMode !== "form") {
      setViewMode("form");
    }
  }, [isTodoFile, viewMode, setViewMode]);

  const fileLayoutId = getFileLayoutId(fileContent);
  const isLayoutLoading =
    fileLayoutId && (!currentLayout || currentLayout.id !== fileLayoutId);

  const isFileLoading = loadedPath !== filePath;

  const renderContent = () => {
    if (isFileLoading) {
      return <div className="editor-loading">Loading file data...</div>;
    }

    if (isImage) return <ImageViewer filePath={filePath} fileBlob={fileBlob} />;
    if (is3DModel) return <ModelViewer filePath={filePath} fileBlob={fileBlob} />;
    if (isLayoutFile) {
      return (
        <LayoutEditor
          key={filePath}
          value={fileContent}
          onChange={setFileContent}
          onSave={onSave}
        />
      );
    }

    if (isTodoFile && viewMode === "form") {
      return (
        <TodoEditor
          key={filePath}
          data={parsedJson}
          onChange={(newData) => setFileContent(JSON.stringify(newData, null, 2))}
        />
      );
    }

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
          data={parsedJson || {}}
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
    !isImage && !is3DModel && (!!fileLayoutId || !!currentMigration || isTodoFile || isFileLoading);

  return (
    <div
      className="editor-content-wrapper"
      style={isLayoutLoading || isFileLoading ? { opacity: 0.7 } : {}}
    >
      {showModeToggle && (
        <EditorTabs
          viewMode={viewMode}
          setViewMode={setViewMode}
          isLayoutLoading={isLayoutLoading}
          isMigrationFile={!!currentMigration}
          onChange={setFileContent}
          isFileLoading={isFileLoading}
          key={filePath}
        />
      )}
      <div className="main-editor-area">{renderContent()}</div>
    </div>
  );
}
