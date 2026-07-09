import React, { useEffect, useMemo, useState } from "react";
import { VscSymbolNumeric, VscSymbolString, VscTrash } from "react-icons/vsc";
import "./DynamicForm.css";
import { useEditor } from "../../../context/EditorContext";

const fileCache = new Map();

const InputComponent = ({ type = "text", icon: Icon, ...props }) => (
  <div className="input-wrapper">
    {Icon && <Icon className="input-icon" />}
    <input type={type} style={Icon ? { paddingLeft: "28px" } : {}} {...props} />
    <div className="input-line"></div>
  </div>
);

const StringArrayComponent = ({ values = [], onArrayChange }) => {
  const addItem = () => onArrayChange([...values, ""]);
  const removeItem = (idx) => onArrayChange(values.filter((_, i) => i !== idx));
  const updateItem = (idx, val) => {
    const newArray = [...values];
    newArray[idx] = val;
    onArrayChange(newArray);
  };

  return (
    <div className="string-array-container">
      {values.map((item, idx) => (
        <div key={idx} className="string-array-item" style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
          <InputComponent
            icon={VscSymbolString}
            value={item ?? ""}
            onChange={(e) => updateItem(idx, e.target.value)}
          />
          <button
            className="btn-delete-small"
            style={{ padding: "6px", cursor: "pointer" }}
            onClick={() => removeItem(idx)}
            title="Видалити"
          >
            <VscTrash />
          </button>
        </div>
      ))}
      <button className="btn-add" onClick={addItem}>+ Додати елемент</button>
    </div>
  );
};

const ObjectArrayComponent = ({ opt, values = [], onArrayChange, renderInput }) => {
  const createDefaultObject = () => opt.self.options.reduce((acc, subOpt) => {
    acc[subOpt.id] = subOpt.default ?? "";
    return acc;
  }, {});

  const syncValues = (currentValues) => currentValues.map((item) => {
    const syncedItem = { ...item };
    opt.self.options.forEach((subOpt) => {
      if (!(subOpt.id in syncedItem)) syncedItem[subOpt.id] = subOpt.default ?? "";
    });
    return syncedItem;
  });

  const addItem = () => onArrayChange(syncValues([...values, createDefaultObject()]));
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
              {renderInput(subOpt, subOpt.id, item[subOpt.id] ?? "", (fid, val) => updateItem(idx, fid, val))}
            </div>
          ))}
          <button className="btn-delete" onClick={() => removeItem(idx)}>Видалити</button>
        </div>
      ))}
      <button className="btn-add" onClick={addItem}>+ Додати {opt.self.title || "елемент"}</button>
    </div>
  );
};

export default function DynamicForm({ structure, uiSchema, data, onChange }) {
  const [, setTick] = useState(0);
  const jsonStructure = structure?.["json-structure"] || structure;
  const formSchema = uiSchema?.["ui-form"] || uiSchema;
  const { fileSystem } = useEditor();

  useEffect(() => {
    if (!data || !jsonStructure) return;
    const mergeData = (struct, currentData) => {
      let changed = false;
      let result = JSON.parse(JSON.stringify(currentData));
      Object.entries(struct).forEach(([key, value]) => {
        if (typeof value === "string" && value.startsWith("$form.")) return;
        if (Array.isArray(value) && value[0]?.$self) {
          if (!Array.isArray(result[key])) { result[key] = []; changed = true; }
          const template = value[0];
          result[key] = result[key].map((item) => {
            let itemChanged = false;
            let newItem = { ...item };
            Object.entries(template).forEach(([subKey, subVal]) => {
              if (subKey === "$self") return;
              if (newItem[subKey] === undefined) { newItem[subKey] = subVal; itemChanged = true; }
            });
            if (itemChanged) changed = true;
            return newItem;
          });
        } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          if (result[key] === undefined) { result[key] = {}; changed = true; }
          const { merged, modified } = mergeData(value, result[key]);
          result[key] = merged;
          if (modified) changed = true;
        } else if (result[key] === undefined) { result[key] = value; changed = true; }
      });
      return { merged: result, modified: changed };
    };
    const { merged, modified } = mergeData(jsonStructure, data);
    if (modified) onChange(merged);
  }, [data, jsonStructure, onChange]);

  const getFileData = async (filePath) => {
    if (fileCache.has(filePath)) return;
    fileCache.set(filePath, "loading");
    const entry = fileSystem.find(f => f.name === filePath.replace(/^\//, ""));
    if (entry?.handle) {
      try {
        const text = await (await entry.handle.getFile()).text();
        fileCache.set(filePath, JSON.parse(text));
        setTick(t => t + 1);
      } catch (e) {
        console.error(e);
        fileCache.set(filePath, null);
      }
    }
  };

  const getSelectOptions = (opt) => {
    const params = opt.params?.data;
    if (params?.values) return params.values;
    if (params?.filePath && params?.key) {
      if (!fileCache.has(params.filePath)) {
        getFileData(params.filePath);
        return [];
      }
      const cached = fileCache.get(params.filePath);
      if (cached === "loading" || !cached) return [];

      const rawData = params.key.split(".").reduce((obj, k) => (obj && obj[k] ? obj[k] : undefined), cached);
      if (!rawData || typeof rawData !== "object") return [];

      if (params.type === "value") return Object.values(rawData);
      if (params.type === "key") return Object.keys(rawData);
      return Array.isArray(rawData) ? rawData : Object.values(rawData);
    }
    return [];
  };

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

  const handleNestedChange = (fieldId, value) => {
    const realPath = pathMap[fieldId];
    const newData = JSON.parse(JSON.stringify(data || {}));
    const keys = realPath ? realPath.split(".") : fieldId.split(".");
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
      case "array": case "stringarray":
        return <StringArrayComponent values={value || []} onArrayChange={(val) => onChange(fieldId, val)} />;
      case "objectarray":
        return <ObjectArrayComponent opt={opt} values={value || []} onArrayChange={(val) => onChange(fieldId, val)} renderInput={renderInput} />;
      case "integer": case "int": case "float": case "number":
        return <InputComponent type="number" icon={VscSymbolNumeric} value={value ?? ""} onChange={(e) => {
          const v = e.target.value;
          onChange(fieldId, v === "" ? 0 : type.includes("int") ? parseInt(v, 10) : parseFloat(v));
        }} />;
      case "boolean": case "bool":
        return <input type="checkbox" className="form-checkbox" checked={!!value} onChange={(e) => onChange(fieldId, e.target.checked)} />;
      case "select":
        const options = getSelectOptions(opt);
        return (
          <select value={value ?? ""} onChange={(e) => onChange(fieldId, e.target.value)} className="form-select">
            <option value="">Виберіть...</option>
            {Array.isArray(options) && options.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
          </select>
        );
      default:
        return <InputComponent icon={VscSymbolString} value={value ?? ""} onChange={(e) => onChange(fieldId, e.target.value)} />;
    }
  };

  if (!formSchema?.categories) return <div className="form-empty">Немає структури</div>;

  return (
    <div className="form-grid">
      {formSchema.categories.map((category, catIdx) => (
        <div key={catIdx} className="form-card">
          <h4 className="category-title">{category.title}</h4>
          <div className="category-fields">
            {category.options.map((opt) => (
              <div key={opt.id} className="form-group">
                <label className="field-label">{opt.title || opt.id}</label>
                {renderInput(opt, opt.id, pathMap[opt.id]?.split(".").reduce((a, p) => (a ? a[p] : undefined), data), handleNestedChange)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
