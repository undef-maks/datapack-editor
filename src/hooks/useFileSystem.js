import { useState, useEffect } from "react";
import { getSettings, loadConfigItems } from "../utils/settingsUtils";

export const useFileSystem = (directoryHandle) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [layoutList, setLayoutList] = useState([]);
  const [migrationList, setMigrationList] = useState([]);

  useEffect(() => {
    if (!directoryHandle) return;
    loadData();
    const interval = setInterval(() => {
      if (window.__isCompiling || window.__isDragging) return;
      loadData();
    }, 6000);

    return () => clearInterval(interval);
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
          if (json._meta?.layout_id) hasLayout = true;
        } catch (e) {}
        results.push({ type: "file", name: path, handle: entry, hasLayout });
      }
    }
    return results;
  };
  const getDirHandleFromPath = async (path, create = false) => {
    if (!path) return directoryHandle;

    const existingEntry = fileSystem.find(
      (f) => f.name === path && f.type === "folder",
    );
    if (existingEntry?.handle) return existingEntry.handle;

    const parts = path.split("/");
    let currentHandle = directoryHandle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create });
    }
    return currentHandle;
  };

  const loadData = async () => {
    const files = await readDirectory(directoryHandle);

    setFileSystem((prev) => {
      if (
        prev.length === files.length &&
        prev.every(
          (f, i) =>
            f.name === files[i]?.name && f.hasLayout === files[i]?.hasLayout,
        )
      ) {
        return prev;
      }
      return files;
    });

    const settings = await getSettings(files);
    if (!settings) return;

    if (settings.layouts) {
      const layouts = await loadConfigItems(files, settings.layouts, "layout");
      setLayoutList(layouts);
    }

    if (settings.migrations) {
      const migrations = await loadConfigItems(
        files,
        settings.migrations,
        "migration",
      );
      setMigrationList(migrations);
    }
  };

  const deleteEntryRecursive = async (dirHandle, name) => {
    const entry = await dirHandle
      .getDirectoryHandle(name, { create: false })
      .catch(() => null);
    if (entry && entry.kind === "directory") {
      for await (const [childName] of entry.entries()) {
        await deleteEntryRecursive(entry, childName);
      }
    }
    await dirHandle.removeEntry(name);
  };

  const copyWebkitEntry = async (entry, targetDirHandle) => {
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) =>
        entry.file(resolve, reject),
      );
      const fileHandle = await targetDirHandle.getFileHandle(entry.name, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
    } else if (entry.isDirectory) {
      const newDirHandle = await targetDirHandle.getDirectoryHandle(
        entry.name,
        { create: true },
      );
      const dirReader = entry.createReader();
      const entries = await new Promise((resolve, reject) =>
        dirReader.readEntries(resolve, reject),
      );
      for (const childEntry of entries) {
        await copyWebkitEntry(childEntry, newDirHandle);
      }
    }
  };

  const handleUploadEntries = async (itemsList, targetPath) => {
    const items = Array.from(itemsList);
    let targetDirHandle = directoryHandle;

    if (targetPath) {
      const found = fileSystem.find(
        (f) =>
          (f.name === targetPath || f.path === targetPath) &&
          f.type === "folder",
      );
      if (found && found.handle) {
        targetDirHandle = found.handle;
      } else {
        targetDirHandle = await getDirHandleFromPath(targetPath);
      }
    }

    for (const item of items) {
      if (item.kind === "file") {
        if (typeof item.webkitGetAsEntry === "function") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await copyWebkitEntry(entry, targetDirHandle);
            continue;
          }
        }
        const file = item.getAsFile();
        if (file) {
          const fileHandle = await targetDirHandle.getFileHandle(file.name, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(file);
          await writable.close();
        }
      }
    }
    await loadData();
  };

  const handleOpenFile = async (
    path,
    setActiveFile,
    setResultContent,
    layoutList,
    setCurrentLayout,
    setViewMode,
  ) => {
    try {
      const fileExtension = path.split(".").pop().toLowerCase();
      const isBinary = [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "webp",
        "ico",
        "svg",
        "glb",
        "gltf",
      ].includes(fileExtension);

      const entry = fileSystem.find((f) => f.name === path);
      if (!entry || !entry.handle) return;

      const file = await entry.handle.getFile();

      if (isBinary) {
        setResultContent("", file);
        if (typeof setCurrentLayout === "function") setCurrentLayout(null);
        return;
      }

      const text = await file.text();
      setResultContent(text, null);

      if (
        layoutList &&
        typeof setCurrentLayout === "function" &&
        typeof setViewMode === "function"
      ) {
        let foundLayoutConfig = layoutList.find((l) =>
          path.startsWith(l.pattern),
        );

        if (!foundLayoutConfig) {
          try {
            const json = JSON.parse(text);
            const metaLayoutId = json._meta?.layout_id;
            if (metaLayoutId) {
              foundLayoutConfig = layoutList.find((l) => l.id === metaLayoutId);
            }
          } catch (e) {}
        }

        let finalLayout = foundLayoutConfig || null;

        if (foundLayoutConfig) {
          try {
            const settingsEntry = fileSystem.find(
              (f) => f.name === "settings.json",
            );
            if (settingsEntry) {
              const settingsText = await (
                await settingsEntry.handle.getFile()
              ).text();
              const settings = JSON.parse(settingsText);
              const config = settings.layouts?.find(
                (l) => l.id === foundLayoutConfig.id,
              );

              if (config) {
                const layoutFileEntry = fileSystem.find(
                  (f) => f.name === config.source,
                );
                if (layoutFileEntry) {
                  const freshLayoutJson = JSON.parse(
                    await (await layoutFileEntry.handle.getFile()).text(),
                  );
                  finalLayout = {
                    id: foundLayoutConfig.id,
                    ...freshLayoutJson,
                  };
                }
              }
            }
          } catch (err) {
            console.error("Failed to hot-reload layout file:", err);
          }
        }

        setCurrentLayout(finalLayout);
        setViewMode(finalLayout ? "form" : "json");
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const handleSave = async (activeFile, fileSystem, fileContent) => {
    const entry = fileSystem.find((f) => f.name === activeFile);
    if (!entry || !entry.handle) {
      console.error("Handle not found for:", activeFile);
      return;
    }

    if (entry.type !== "file") return;

    try {
      const w = await entry.handle.createWritable();
      await w.write(fileContent);
      await w.close();
    } catch (err) {
      console.error("Write error:", err);
    }
  };
  const handleCreateFile = async (
    name,
    parentPath,
    layoutId,
    setFileSystem,
  ) => {
    const fileName = name.endsWith(".json") ? name : `${name}.json`;
    const targetDir = await getDirHandleFromPath(parentPath);
    const fileHandle = await targetDir.getFileHandle(fileName, {
      create: true,
    });
    let initialData = { id: name.replace(".json", "") };
    if (layoutId)
      initialData = {
        _meta: { layout_id: layoutId, version: "1.0.0" },
        ...initialData,
      };
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
  };

  const handleCreateFolder = async (folderName, parentPath, setFileSystem) => {
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
  };

  const handleDelete = async (path, setFileSystem) => {
    const parts = path.split("/");
    const name = parts.pop();
    const parentPath = parts.join("/");
    const dirHandle = await getDirHandleFromPath(parentPath);
    await deleteEntryRecursive(dirHandle, name);
    setFileSystem((prev) =>
      prev.filter((f) => f.name !== path && !f.name.startsWith(path + "/")),
    );
  };

  const handleUpdateLayout = async (
    path,
    layoutId,
    fileSystem,
    setFileSystem,
    onComplete,
  ) => {
    const entry = fileSystem.find((f) => f.name === path);
    const text = await (await entry.handle.getFile()).text();
    const json = JSON.parse(text);
    json._meta = { ...json._meta, layout_id: layoutId };
    const w = await entry.handle.createWritable();
    await w.write(JSON.stringify(json, null, 2));
    await w.close();
    setFileSystem((prev) =>
      prev.map((f) => (f.name === path ? { ...f, hasLayout: true } : f)),
    );
    onComplete(path);
  };

  const moveDirectoryRecursive = async (
    sourceDirHandle,
    targetParentDirHandle,
    dirName,
  ) => {
    const newDirHandle = await targetParentDirHandle.getDirectoryHandle(
      dirName,
      { create: true },
    );
    for await (const entry of sourceDirHandle.values()) {
      if (entry.kind === "directory") {
        await moveDirectoryRecursive(entry, newDirHandle, entry.name);
      } else {
        const file = await entry.getFile();
        const newFileHandle = await newDirHandle.getFileHandle(entry.name, {
          create: true,
        });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }
    }
  };

  const handleRenameFile = async (oldPath, newPath, setFileSystem) => {
    if (oldPath === newPath) return;

    const oldPathParts = oldPath.split("/");
    const oldName = oldPathParts.pop();
    const oldDirPath = oldPathParts.join("/");

    const targetPathParts = newPath.split("/");
    const newName = targetPathParts.pop();
    const targetDirPath = targetPathParts.join("/");

    const sourceEntry = fileSystem.find((f) => f.name === oldPath);
    if (!sourceEntry) return;

    const entryHandle = sourceEntry.handle;

    let targetDirHandle = directoryHandle;
    if (targetDirPath) {
      const foundFolder = fileSystem.find(
        (f) => f.name === targetDirPath && f.type === "folder",
      );
      if (foundFolder && foundFolder.handle) {
        targetDirHandle = foundFolder.handle;
      } else {
        targetDirHandle = await getDirHandleFromPath(targetDirPath);
      }
    }

    if (sourceEntry.type === "file") {
      if (oldDirPath === targetDirPath) {
        await entryHandle.move(newName);
      } else {
        await entryHandle.move(targetDirHandle, newName);
      }
    } else if (sourceEntry.type === "folder") {
      if (oldDirPath === targetDirPath) {
        const sourceDir = await getDirHandleFromPath(oldDirPath);
        await moveDirectoryRecursive(entryHandle, sourceDir, newName);
      } else {
        await moveDirectoryRecursive(entryHandle, targetDirHandle, newName);
      }
      const parentDir = await getDirHandleFromPath(oldDirPath);
      await deleteEntryRecursive(parentDir, oldName);
    }

    await loadData();
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
    handleDelete,
    handleUpdateLayout,
    handleRenameFile,
    handleUploadEntries,
    refreshDirectory: loadData,
    migrationList,
  };
};
