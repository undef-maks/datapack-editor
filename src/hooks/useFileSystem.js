import { useState, useEffect } from "react";

export const useFileSystem = (directoryHandle) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [layoutList, setLayoutList] = useState([]);

  useEffect(() => {
    if (!directoryHandle) return;
    loadData();
  }, [directoryHandle]);

  const readDirectory = async (dirHandle, currentPath = "") => {
    let results = [];
    for await (const entry of dirHandle.values()) {
      const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      if (entry.kind === "directory") {
        results.push({ type: "folder", name: path, handle: entry });
        results = results.concat(await readDirectory(entry, path));
      } else {
        let hasLayout = false;
        try {
          const text = await (await entry.getFile()).text();
          const json = JSON.parse(text);
          if (json._meta?.layoutId) hasLayout = true;
        } catch (e) {}
        results.push({ type: "file", name: path, handle: entry, hasLayout });
      }
    }
    return results;
  };

  const loadData = async () => {
    const files = await readDirectory(directoryHandle);
    setFileSystem(files);
    try {
      const settingsEntry = files.find(
        (f) => f.name === "datapack_settings.json",
      );
      if (!settingsEntry) return;
      const settings = JSON.parse(
        await (await settingsEntry.handle.getFile()).text(),
      );
      const layoutEntry = files.find((f) => f.name === settings.layoutsPath);
      if (layoutEntry) {
        const layouts = JSON.parse(
          await (await layoutEntry.handle.getFile()).text(),
        );
        setLayoutList(layouts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getDirHandleFromPath = async (path) => {
    if (!path) return directoryHandle;
    const parts = path.split("/");
    let currentHandle = directoryHandle;
    for (const part of parts)
      currentHandle = await currentHandle.getDirectoryHandle(part, {
        create: true,
      });
    return currentHandle;
  };

  const handleOpenFile = async (
    path,
    setActiveFile,
    setFileContent,
    layoutList,
    setCurrentLayout,
    setViewMode,
  ) => {
    setActiveFile(path);
    const fileEntry = fileSystem.find((f) => f.name === path);
    if (fileEntry && fileEntry.type === "file") {
      const text = await (await fileEntry.handle.getFile()).text();
      setFileContent(text);
      const json = JSON.parse(text);
      const layoutRef = json._meta?.layoutId
        ? layoutList.find((l) => l.id === json._meta.layoutId)
        : null;
      if (layoutRef?.source) {
        const layoutEntry = fileSystem.find((f) => f.name === layoutRef.source);
        if (layoutEntry)
          setCurrentLayout(
            JSON.parse(await (await layoutEntry.handle.getFile()).text()),
          );
      } else setCurrentLayout(layoutRef);
      setViewMode(layoutRef ? "form" : "json");
    }
  };

  const handleSave = async (activeFile, fileSystem, fileContent) => {
    const entry = fileSystem.find((f) => f.name === activeFile);
    const w = await entry.handle.createWritable();
    await w.write(fileContent);
    await w.close();
  };

  const handleCreateFile = async (
    name,
    parentPath,
    layoutId,
    setFileSystem,
    setActiveModal,
    setModalInput,
  ) => {
    const fileName = name.endsWith(".json") ? name : `${name}.json`;
    const targetDir = await getDirHandleFromPath(parentPath);
    const fileHandle = await targetDir.getFileHandle(fileName, {
      create: true,
    });
    let initialData = { id: name.replace(".json", "") };
    if (layoutId)
      initialData = { _meta: { layoutId, version: "1.0.0" }, ...initialData };
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(initialData, null, 2));
    await writable.close();
    setFileSystem((prev) => [
      ...prev,
      {
        type: "file",
        name: parentPath ? `${parentPath}/${fileName}` : fileName,
        handle: fileHandle,
        hasLayout: !!layoutId,
      },
    ]);
    setActiveModal(null);
    setModalInput("");
  };

  const handleCreateFolder = async (
    folderName,
    parentPath,
    setFileSystem,
    setActiveModal,
    setModalInput,
  ) => {
    const targetDir = await getDirHandleFromPath(parentPath);
    const folderHandle = await targetDir.getDirectoryHandle(folderName, {
      create: true,
    });
    setFileSystem((prev) => [
      ...prev,
      {
        type: "folder",
        name: parentPath ? `${parentPath}/${folderName}` : folderName,
        handle: folderHandle,
        children: [],
      },
    ]);
    setActiveModal(null);
    setModalInput("");
  };

  const handleUpdateLayout = async (
    path,
    layoutId,
    fileSystem,
    setFileSystem,
    setActiveModal,
    setModalInput,
    onComplete,
  ) => {
    const entry = fileSystem.find((f) => f.name === path);
    const text = await (await entry.handle.getFile()).text();
    const json = JSON.parse(text);
    json._meta = { ...json._meta, layoutId };
    const w = await entry.handle.createWritable();
    await w.write(JSON.stringify(json, null, 2));
    await w.close();
    setFileSystem((prev) =>
      prev.map((f) => (f.name === path ? { ...f, hasLayout: true } : f)),
    );
    setActiveModal(null);
    setModalInput("");
    onComplete(path);
  };

  return {
    fileSystem,
    setFileSystem,
    layoutList,
    getDirHandleFromPath,
    handleOpenFile,
    handleSave,
    handleCreateFile,
    handleCreateFolder,
    handleUpdateLayout,
  };
};
