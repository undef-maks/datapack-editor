export const applyMigration = (data, template) => {
  const result = { ...template };

  const replacePlaceholders = (obj, sourceData) => {
    for (const key in obj) {
      if (typeof obj[key] === "string" && obj[key].startsWith("$")) {
        const path = obj[key].slice(1).split(".");
        let value = sourceData;

        for (const part of path) {
          value = value ? value[part] : undefined;
        }

        obj[key] = value !== undefined ? value : obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        replacePlaceholders(obj[key], sourceData);
      }
    }
  };

  replacePlaceholders(result, data);
  return result;
};
