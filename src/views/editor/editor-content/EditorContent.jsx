import React, { useMemo, useRef } from "react";
import JSONEditor from "../json-editor/JSONEditor";
import LayoutEditor from "../json-editor/LayoutEditor";
import DynamicForm from "../dynamic-form/DynamicForm";
import ImageViewer from "./../image-viewer/ImageViewer";
import ModelViewer from "./model-viewer/ModelViewer";
import { isModelFile, isImageFile, getFileLayoutId } from "@utils/editorUtils";
import { VscCode, VscListSelection } from "react-icons/vsc";
import "./EditorContent.css";

export default function EditorContent({
  viewMode,
  setViewMode,
  currentLayout,
  filePath,
  fileContent,
  fileBlob,
  setFileContent,
}) {
  const isImage = useMemo(() => isImageFile(filePath), [filePath]);
  const is3DModel = useMemo(() => isModelFile(filePath), [filePath]);
  const isLayoutFile = useMemo(
    () => filePath?.startsWith("layouts/"),
    [filePath],
  );

  const lastValidLayoutRef = useRef(null);
  if (currentLayout) {
    lastValidLayoutRef.current = currentLayout;
  }

  const data = useMemo(() => {
    if (isImage || is3DModel) return {};
    try {
      return fileContent ? JSON.parse(fileContent) : {};
    } catch (e) {
      return {};
    }
  }, [fileContent, isImage, is3DModel]);

  const fileLayoutId = getFileLayoutId(fileContent);
  const hasLayoutRef = useRef(false);

  if (fileContent) {
    hasLayoutRef.current = !!fileLayoutId;
  }

  if (isImage) {
    return <ImageViewer filePath={filePath} fileBlob={fileBlob} />;
  }

  if (is3DModel) {
    return <ModelViewer filePath={filePath} fileBlob={fileBlob} />;
  }

  if (isLayoutFile) {
    return (
      <div className="editor-content-wrapper">
        <div className="main-editor-area">
          <LayoutEditor
            key={filePath}
            value={fileContent}
            onChange={setFileContent}
          />
        </div>
      </div>
    );
  }

  const showModeToggle =
    !isImage && !is3DModel && (!!fileLayoutId || hasLayoutRef.current);
  const isLayoutLoading =
    fileLayoutId && (!currentLayout || currentLayout.id !== fileLayoutId);
  const activeLayout = currentLayout || lastValidLayoutRef.current;

  const handleDataChange = (newData) => {
    setFileContent(JSON.stringify(newData, null, 2));
  };

  const renderEditorArea = () => {
    if (viewMode === "form" && activeLayout && !isLayoutLoading) {
      return (
        <DynamicForm
          structure={activeLayout["json-structure"] || {}}
          uiSchema={activeLayout["ui-form"] || {}}
          data={data}
          onChange={handleDataChange}
        />
      );
    }

    if (viewMode === "json" && !isLayoutLoading) {
      return (
        <JSONEditor
          key={filePath}
          value={fileContent}
          onChange={setFileContent}
        />
      );
    }

    return null;
  };

  return (
    <div
      className="editor-content-wrapper"
      style={isLayoutLoading ? { pointerEvents: "none", opacity: 0.7 } : {}}
    >
      {showModeToggle && (
        <div className="view-mode-tabs">
          <button
            className={`tab-button ${viewMode === "form" ? "active" : ""}`}
            onClick={() => setViewMode("form")}
            disabled={isLayoutLoading}
          >
            <VscListSelection />
            <span>Форма</span>
          </button>
          <button
            className={`tab-button ${viewMode === "json" ? "active" : ""}`}
            onClick={() => setViewMode("json")}
            disabled={isLayoutLoading}
          >
            <VscCode />
            <span>JSON Редактор</span>
          </button>
        </div>
      )}

      <div className="main-editor-area">{renderEditorArea()}</div>
    </div>
  );
}
