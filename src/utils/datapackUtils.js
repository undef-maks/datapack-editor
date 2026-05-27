export const createDatapackStructure = async (
  rootHandle,
  gameName,
  datapackName,
) => {
  const layoutsDir = await rootHandle.getDirectoryHandle("layouts", {
    create: true,
  });
  const dataDir = await rootHandle.getDirectoryHandle("data", { create: true });

  const createFile = async (parent, name, content) => {
    const handle = await parent.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(
      typeof content === "string" ? content : JSON.stringify(content, null, 2),
    );
    await writable.close();
  };

  await createFile(layoutsDir, "layouts.json", []);
  await createFile(rootHandle, "manifest.json", {
    game: gameName,
    name: datapackName,
    version: "1.0.0",
  });
  await createFile(rootHandle, "datapack_settings.json", {
    layoutsPath: "layouts/layouts.json",
  });

  return { rootHandle, layoutsDir, dataDir };
};
