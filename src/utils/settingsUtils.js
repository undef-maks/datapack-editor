export const getSettings = async (fileSystem) => {
  const settingsEntry = fileSystem.find((f) => f.name === "settings.json");
  if (!settingsEntry) return null;

  try {
    const text = await (await settingsEntry.handle.getFile()).text();
    return JSON.parse(text);
  } catch (e) {
    console.error("Error loading settings.json:", e);
    return null;
  }
};

export const loadConfigItems = async (fileSystem, configList, type) => {
  const items = [];
  if (!Array.isArray(configList)) return items;

  for (const config of configList) {
    const entry = fileSystem.find((f) => f.name === config.source);
    if (entry) {
      try {
        const text = await (await entry.handle.getFile()).text();
        const json = JSON.parse(text);
        items.push({
          id: config.id,
          path: config.source,
          ...json,
        });
      } catch (err) {
        console.error(`Error parsing ${type} file: ${config.source}`, err);
      }
    }
  }
  return items;
};
