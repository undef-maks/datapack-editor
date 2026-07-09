export function generateInitialJson(layout, layoutId) {
  const structure = layout["json-structure"] || {};
  const formSchema = layout["ui-form"] || {};

  const defaultValuesMap = new Map();
  if (formSchema.categories && Array.isArray(formSchema.categories)) {
    formSchema.categories.forEach((category) => {
      if (category.options && Array.isArray(category.options)) {
        category.options.forEach((opt) => {
          if (opt.id && opt.default !== undefined) {
            defaultValuesMap.set(opt.id, opt.default);
          }
        });
      }
    });
  }

  const cleanStructure = (obj) => {
    if (typeof obj === "string" && obj.startsWith("$form.")) {
      const fieldId = obj.replace("$form.", "");
      if (defaultValuesMap.has(fieldId)) {
        return defaultValuesMap.get(fieldId);
      }
      return "";
    }

    if (Array.isArray(obj) && obj.length === 1 && typeof obj[0] === "string" && obj[0].startsWith("$form.")) {
      const fieldId = obj[0].replace("$form.", "");
      if (defaultValuesMap.has(fieldId)) {
        return defaultValuesMap.get(fieldId);
      }
      return [];
    }

    if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
      const newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = cleanStructure(obj[key]);
        }
      }
      return newObj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => cleanStructure(item));
    }

    return obj;
  };

  return {
    _meta: { layout_id: layoutId },
    ...cleanStructure(structure),
  };
}
