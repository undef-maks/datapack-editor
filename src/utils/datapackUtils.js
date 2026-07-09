export const createDatapackStructure = async (
  rootHandle,
  gameName,
  datapackName,
) => {
  const createFile = async (parent, name, content) => {
    const handle = await parent.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(
      typeof content === "string" ? content : JSON.stringify(content, null, 2),
    );
    await writable.close();
  };

  const srcDir = await rootHandle.getDirectoryHandle("src", { create: true });
  const dataDir = await srcDir.getDirectoryHandle("data", { create: true });
  const assetsDir = await srcDir.getDirectoryHandle("assets", { create: true });
  const layoutsDir = await rootHandle.getDirectoryHandle("layouts", {
    create: true,
  });

  await createFile(rootHandle, "manifest.json", {
    game: gameName,
    name: datapackName,
    version: "1.0.0",
  });
  await createFile(rootHandle, "settings.json", {
    layouts: [],
  });

  return { rootHandle, srcDir, dataDir, assetsDir, layoutsDir };
};
