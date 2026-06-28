export function generateInitialJson(layout, layoutId) {
  const structure = layout["json-structure"] || {};

  const cleanStructure = (obj) => {
    if (typeof obj === "string" && obj.startsWith("$form.")) {
      return "";
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
