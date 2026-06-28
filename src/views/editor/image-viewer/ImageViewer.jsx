import React, { useState, useMemo, useEffect, useRef } from "react";
import { VscZoomIn, VscZoomOut, VscScreenFull } from "react-icons/vsc";
import "./ImageViewer.css";

export default function ImageViewer({ filePath, fileBlob }) {
  const [zoom, setZoom] = useState(100);
  const workspaceRef = useRef(null);

  const fileName = filePath.split("/").pop();

  const imageUrl = useMemo(() => {
    if (fileBlob instanceof Blob) {
      return URL.createObjectURL(fileBlob);
    }
    return filePath;
  }, [fileBlob, filePath]);

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 15 : -15;
      setZoom((prev) => Math.min(500, Math.max(10, prev + zoomFactor)));
    };

    workspace.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      workspace.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="image-viewer-container">
      <div className="image-viewer-toolbar">
        <span>{fileName}</span>

        <div className="image-viewer-controls">
          <button
            className="image-viewer-btn"
            onClick={() => setZoom((prev) => Math.max(10, prev - 15))}
          >
            <VscZoomOut size={18} />
          </button>
          <span className="image-viewer-zoom-text">{zoom}%</span>
          <button
            className="image-viewer-btn"
            onClick={() => setZoom((prev) => Math.min(500, prev + 15))}
          >
            <VscZoomIn size={18} />
          </button>
          <button
            className="image-viewer-btn"
            style={{ marginLeft: "8px" }}
            onClick={() => setZoom(100)}
            title="Reset"
          >
            <VscScreenFull size={18} />
          </button>
        </div>
      </div>

      <div ref={workspaceRef} className="image-viewer-workspace">
        <img
          src={imageUrl}
          alt={fileName}
          className="image-viewer-img"
          style={{
            transform: `scale(${zoom / 100})`,
          }}
        />
      </div>
    </div>
  );
}
