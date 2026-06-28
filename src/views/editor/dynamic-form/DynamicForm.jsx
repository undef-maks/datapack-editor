import React, { useMemo, useEffect } from "react";
import { VscSymbolNumeric, VscSymbolString } from "react-icons/vsc";
import "./DynamicForm.css";

const InputComponent = ({ type = "text", icon: Icon, ...props }) => (
  <div className="input-wrapper">
    {Icon && <Icon className="input-icon" />}
    <input type={type} style={Icon ? { paddingLeft: "28px" } : {}} {...props} />
    <div className="input-line"></div>
  </div>
);

const ObjectArrayComponent = ({
  opt,
  values = [],
  onArrayChange,
  renderInput,
}) => {
  const addItem = () => onArrayChange([...values, {}]);
  const removeItem = (idx) => onArrayChange(values.filter((_, i) => i !== idx));
  const updateItem = (idx, fieldId, value) => {
    const newArray = [...values];
    newArray[idx] = { ...newArray[idx], [fieldId]: value };
    onArrayChange(newArray);
  };

  return (
    <div className="object-array-container">
      {values.map((item, idx) => (
        <div key={idx} className="array-item-card">
          {opt.self.options.map((subOpt) => (
            <div key={subOpt.id} className="form-group">
              <label className="field-label">{subOpt.title}</label>
              {renderInput(
                subOpt,
                subOpt.id,
                item[subOpt.id] ?? "",
                (fid, val) => updateItem(idx, fid, val),
              )}
            </div>
          ))}
          <button className="btn-delete" onClick={() => removeItem(idx)}>
            Видалити
          </button>
        </div>
      ))}
      <button className="btn-add" onClick={addItem}>
        + Додати {opt.self.title || "елемент"}
      </button>
    </div>
  );
};

export default function DynamicForm({ structure, uiSchema, data, onChange }) {
  const jsonStructure = structure?.["json-structure"] || structure;
  const formSchema = uiSchema?.["ui-form"] || uiSchema;

  const pathMap = useMemo(() => {
    const map = {};
    if (!jsonStructure) return map;
    const traverse = (obj, path = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "string" && value.startsWith("$form.")) {
          map[value.replace("$form.", "")] = currentPath;
        } else if (typeof value === "object" && value !== null) {
          traverse(value, currentPath);
        }
      });
    };
    traverse(jsonStructure);
    return map;
  }, [jsonStructure]);

  useEffect(() => {
    if (!formSchema?.categories || !data) return;
    let needsUpdate = false;
    const newData = JSON.parse(JSON.stringify(data));
    formSchema.categories.forEach((category) => {
      category.options.forEach((opt) => {
        if (opt.default !== undefined && opt.id) {
          const realPath = pathMap[opt.id];
          if (!realPath) return;
          const keys = realPath.split(".");
          let current = newData;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          if (current[keys[keys.length - 1]] === undefined) {
            current[keys[keys.length - 1]] = opt.default;
            needsUpdate = true;
          }
        }
      });
    });
    if (needsUpdate) onChange(newData);
  }, [data, formSchema, pathMap, onChange]);

  const handleNestedChange = (fieldId, value) => {
    const realPath = pathMap[fieldId];
    if (!realPath) return;
    const newData = JSON.parse(JSON.stringify(data || {}));
    const keys = realPath.split(".");
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      if (!current[key]) current[key] = !isNaN(nextKey) ? [] : {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const renderInput = (opt, fieldId, value, onChange) => {
    const type = opt?.type?.toLowerCase();
    switch (type) {
      case "objectarray":
        return (
          <ObjectArrayComponent
            opt={opt}
            values={value || []}
            onArrayChange={(val) => onChange(fieldId, val)}
            renderInput={renderInput}
          />
        );
      case "integer":
      case "int":
      case "float":
      case "number":
        return (
          <InputComponent
            type="number"
            icon={VscSymbolNumeric}
            value={value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange(
                fieldId,
                v === ""
                  ? 0
                  : type.includes("int")
                    ? parseInt(v, 10)
                    : parseFloat(v),
              );
            }}
          />
        );
      case "boolean":
      case "bool":
        return (
          <input
            type="checkbox"
            className="form-checkbox"
            checked={!!value}
            onChange={(e) => onChange(fieldId, e.target.checked)}
          />
        );
      default:
        return (
          <InputComponent
            icon={VscSymbolString}
            value={value ?? ""}
            onChange={(e) => onChange(fieldId, e.target.value)}
          />
        );
    }
  };

  if (!formSchema?.categories)
    return <div className="form-empty">Немає структури</div>;

  return (
    <div className="form-grid">
      {formSchema.categories.map((category, catIdx) => (
        <div key={catIdx} className="form-card">
          <h4 className="category-title">{category.title}</h4>
          <div className="category-fields">
            {category.options.map((opt) => (
              <div key={opt.id} className="form-group">
                <label className="field-label">{opt.title || opt.id}</label>
                {renderInput(
                  opt,
                  opt.id,
                  pathMap[opt.id]
                    ?.split(".")
                    .reduce((a, p) => (a ? a[p] : undefined), data),
                  handleNestedChange,
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
