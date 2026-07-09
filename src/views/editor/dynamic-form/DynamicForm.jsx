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

const SelectArrayComponent = ({ values = [], options = [], onArrayChange }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleAdd = () => {
    if (selectedValue && !values.includes(selectedValue)) {
      onArrayChange([...values, selectedValue]);
      setSelectedValue("");
    }
  };

  const handleRemove = (idx) => {
    onArrayChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div className="select-array-container">
      <div className="select-array-controls" style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          className="form-select"
          style={{ flex: 1 }}
        >
          <option value="">Виберіть елемент для додавання...</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt} disabled={values.includes(opt)}>
              {opt} {values.includes(opt) ? "(вже додано)" : ""}
            </option>
          ))}
        </select>
        <button
          className="btn-add"
          onClick={handleAdd}
          disabled={!selectedValue}
          style={{ margin: 0, whiteSpace: "nowrap" }}
        >
          + Додати
        </button>
      </div>

      <div className="select-array-list">
        {values.map((item, idx) => (
          <div key={idx} className="string-array-item" style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
            <div className="input-wrapper" style={{ flex: 1, display: "flex", alignItems: "center", padding: "6px 12px", background: "var(--bg-input, #252526)", borderRadius: "4px" }}>
              <VscSymbolString className="input-icon" style={{ marginRight: "8px", opacity: 0.7 }} />
              <span>{item}</span>
            </div>
            <button
              className="btn-delete-small"
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => handleRemove(idx)}
              title="Видалити"
            >
              <VscTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент працює з масивом всередині ключа $self, зберігаючи сусідні декларації шаблону
const ObjectArrayComponent = ({ opt, currentContainer, onArrayChange, renderInput }) => {

  // Безпечно дістаємо поточний масив елементів з $self
  const items = Array.isArray(currentContainer?.$self) ? currentContainer.$self : [];

  const createDefaultObject = () => {
    return opt.self.options.reduce((acc, subOpt) => {
      acc[subOpt.id] = subOpt.default ?? "";
      return acc;
    }, {});
  };

  const updateParent = (newItems) => {
    // Повертаємо весь контейнер, замінюючи тільки $self, та зберігаючи інші ключі ("id", "count" тощо)
    onArrayChange({
      ...currentContainer,
      "$self": newItems
    });
  };

  const addItem = () => {
    updateParent([...items, createDefaultObject()]);
  };

  const removeItem = (idx) => {
    updateParent(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, fieldId, val) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [fieldId]: val };
    updateParent(newItems);
  };

  return (
    <div className="object-array-container">
      {items.map((item, idx) => (
        <div key={idx} className="array-item-card" style={{ border: "1px solid #333", padding: "12px", marginBottom: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.02)" }}>
          {opt.self.options.map((subOpt) => (
            <div key={subOpt.id} className="form-group" style={{ marginBottom: "8px" }}>
              <label className="field-label" style={{ display: "block", marginBottom: "4px", fontSize: "12px", opacity: 0.8 }}>{subOpt.title}</label>
              {renderInput(subOpt, subOpt.id, item[subOpt.id] ?? "", (fid, val) => updateItem(idx, fid, val))}
            </div>
          ))}
          <button className="btn-delete" style={{ marginTop: "4px" }} onClick={() => removeItem(idx)}>Видалити</button>
        </div>
      ))}
      <button className="btn-add" onClick={addItem}>+ Додати {opt.self?.title || "елемент"}</button>
    </div>
  );
};

export default function DynamicForm({ structure, uiSchema, data, onChange }) {
  const [, setTick] = useState(0);
  const jsonStructure = structure?.["json-structure"] || structure;
  const formSchema = uiSchema?.["ui-form"] || uiSchema;
  const { fileSystem } = useEditor();

  // pathMap тепер будує шлях безпосередньо до ОБ'ЄКТА-КОНТЕЙНЕРА (батька $self), 
  // щоб ObjectArray міг прочитати та зберегти сусідні мета-поля.
  const pathMap = useMemo(() => {
    const map = {};
    if (!jsonStructure) return map;

    const traverse = (obj, path = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "string" && value.startsWith("$form.")) {
          map[value.replace("$form.", "")] = currentPath;
        } else if (Array.isArray(value) && value[0] && typeof value[0] === "object") {
          const templateObj = value[0];
          // Шукаємо або рядок-посилання, або об'єкт, який вже ініціалізовано
          const selfRef = templateObj.$self;
          if (typeof selfRef === "string" && selfRef.startsWith("$form.")) {
            const formId = selfRef.replace("$form.", "");
            // Шлях веде до нульового індексу масиву (до самого об'єкта, де живуть $self, id, count)
            map[formId] = `${currentPath}.0`;
          }
        } else if (typeof value === "object" && value !== null) {
          traverse(value, currentPath);
        }
      });
    };
    traverse(jsonStructure);
    return map;
  }, [jsonStructure]);

  // Ефект синхронізації схеми з початковими даними
  useEffect(() => {
    if (!data || !jsonStructure) return;
    const mergeData = (struct, currentData) => {
      let changed = false;
      let result = JSON.parse(JSON.stringify(currentData));

      Object.entries(struct).forEach(([key, value]) => {
        if (typeof value === "string" && value.startsWith("$form.")) return;

        if (Array.isArray(value) && value[0] && typeof value[0] === "object" && value[0].$self) {
          if (!Array.isArray(result[key]) || result[key].length === 0) {
            // Клонуємо весь шаблон-декларацію з json-structure, замінюючи рядок посилання на масив
            const initialContainer = { ...value[0], "$self": [] };
            result[key] = [initialContainer];
            changed = true;
          }
        } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          if (result[key] === undefined) { result[key] = {}; changed = true; }
          const { merged, modified } = mergeData(value, result[key]);
          result[key] = merged;
          if (modified) changed = true;
        } else if (result[key] === undefined) {
          result[key] = value;
          changed = true;
        }
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
      case "selectarray":
        const selectArrayOptions = getSelectOptions(opt);
        return <SelectArrayComponent values={value || []} options={selectArrayOptions} onArrayChange={(val) => onChange(fieldId, val)} />;
      case "objectarray":
        return (
          <ObjectArrayComponent
            opt={opt}
            currentContainer={value} // Сюди прийде весь об'єкт { $self: [...], id: ..., count: ... }
            onArrayChange={(val) => onChange(fieldId, val)}
            renderInput={renderInput}
          />
        );
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
