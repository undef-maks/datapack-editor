import React, { useState, useEffect } from "react";
import "@google/model-viewer";
import "./ModelViewer.css";

export default function ModelViewer({ filePath, fileBlob }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [exposure, setExposure] = useState(1.2);

  useEffect(() => {
    if (!fileBlob) {
      setModelUrl(null);
      return;
    }
    const url = URL.createObjectURL(fileBlob);
    setModelUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [fileBlob]);

  if (!modelUrl) {
    return <div className="model-viewer-error">Завантаження 3D моделі...</div>;
  }

  return (
    <div className="model-viewer-container">
      <model-viewer
        src={modelUrl}
        alt={`3D Model: ${filePath}`}
        camera-controls
        auto-rotate
        shadow-intensity="1.5"
        shadow-softness="1"
        exposure={exposure}
        environment-image="neutral"
        interaction-prompt="none"
        style={{ width: "100%", height: "100%", background: "var(--bg-color)" }}
      >
        <div className="model-viewer-controls">
          <label htmlFor="exposure-slider">
            Освітлення: {exposure.toFixed(1)}
          </label>
          <input
            id="exposure-slider"
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={exposure}
            onChange={(e) => setExposure(parseFloat(e.target.value))}
          />
        </div>
        <div className="model-viewer-hint">
          <span>ЛКМ + Рух — Обертання | ПКМ + Рух — Зсув | Scroll — Зум</span>
        </div>
      </model-viewer>
    </div>
  );
}
