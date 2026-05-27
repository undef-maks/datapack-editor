import React, { useMemo } from "react";
import "./DynamicForm.css";

const InputComponent = ({ type = "text", ...props }) => (
  <div className="input-wrapper">
    <input type={type} {...props} />
    <div className="input-line"></div>
  </div>
);

export default function DynamicForm({ uiSchema, structure, data, onChange }) {
  const pathMap = useMemo(() => {
    const map = {};
    const traverse = (obj, path = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "string" && value.startsWith("$ref.")) {
          map[value.replace("$ref.", "")] = currentPath;
        } else if (typeof value === "object" && value !== null) {
          traverse(value, currentPath);
        }
      });
    };
    traverse(structure);
    return map;
  }, [structure]);

  const handleNestedChange = (refId, value) => {
    const realPath = pathMap[refId];
    if (!realPath) return;

    const newData = JSON.parse(JSON.stringify(data || {}));
    const keys = realPath.split(".");
    let current = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  if (!uiSchema || !uiSchema.categories || !structure) return null;

  return (
    <div className="form-grid">
      {uiSchema.categories.map((category, catIdx) => (
        <div key={catIdx} className="form-card">
          <h4>{category.title}</h4>
          {category.options.map((opt) => {
            const realPath = pathMap[opt.id];
            const val =
              realPath
                ?.split(".")
                .reduce((acc, p) => (acc ? acc[p] : undefined), data) ?? "";

            return (
              <div key={opt.id} className="form-group">
                <label>{opt.title}</label>
                {renderInput(opt, opt.id, val, handleNestedChange)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const renderInput = (opt, refId, value, onChange) => {
  switch (opt?.type) {
    case "integer":
    case "float":
      return (
        <InputComponent
          type="number"
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              refId,
              opt.type === "integer"
                ? parseInt(e.target.value) || 0
                : parseFloat(e.target.value) || 0,
            )
          }
        />
      );
    default:
      return (
        <InputComponent
          value={value ?? ""}
          onChange={(e) => onChange(refId, e.target.value)}
        />
      );
  }
};
