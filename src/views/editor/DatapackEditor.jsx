import { useState, useEffect } from "react";
import Modal from "../../components/modal/Modal";
import FileBrowser from "./file-browser/FileBrowser";
import "./DatapackEditor.css";

export default function DatapackEditor({ setView, autoSave, directoryHandle }) {
  const [editorMode, setEditorMode] = useState("object");
  const [activeFile, setActiveFile] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [fileSystem, setFileSystem] = useState([]);
  const [newFileName, setNewFileName] = useState("");
  const [newDirName, setNewDirName] = useState("");

  const [mockFormData, setMockFormData] = useState({
    id: "",
    name: "",
    description: "",
    width: 1,
    height: 1,
    totalAmount: 0,
    dropId: "",
    dropCount: 1,
  });

  useEffect(() => {
    if (!directoryHandle) return;

    const readDirectory = async (dirHandle, currentPath = "") => {
      let results = [];
      for await (const entry of dirHandle.values()) {
        const relativePath = currentPath
          ? `${currentPath}/${entry.name}`
          : entry.name;
        if (entry.kind === "directory") {
          results.push({ type: "folder", name: relativePath, handle: entry });
          const subDirResults = await readDirectory(entry, relativePath);
          results = results.concat(subDirResults);
        } else if (entry.kind === "file") {
          results.push({ type: "file", name: relativePath, handle: entry });
        }
      }
      return results;
    };

    const loadFiles = async () => {
      try {
        const files = await readDirectory(directoryHandle);
        files.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === "folder" ? -1 : 1;
        });
        setFileSystem(files);

        const firstJson = files.find(
          (f) => f.type === "file" && f.name.endsWith(".json"),
        );
        if (firstJson) {
          setActiveFile(firstJson.name);
          await handleOpenFile(firstJson);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadFiles();
  }, [directoryHandle]);

  const handleOpenFile = async (fileItem) => {
    if (!fileItem || !fileItem.handle) return;

    try {
      const file = await fileItem.handle.getFile();
      const text = await file.text();
      const json = JSON.parse(text);

      setMockFormData({
        id: json.id || "",
        name: json.display?.name || "",
        description: json.display?.description || "",
        width: json.worldSize?.width || json.world?.size?.width || 1,
        height: json.worldSize?.height || json.world?.size?.height || 1,
        totalAmount: json.stats?.totalAmount || 0,
        dropId: json.stats?.drop?.items?.[0]?.id || "",
        dropCount: json.stats?.drop?.items?.[0]?.count || 1,
      });
    } catch (err) {
      console.error("Помилка читання файлу:", err);
    }
  };

  const handleSelectFile = async (filePath) => {
    setActiveFile(filePath);
    const fileItem = fileSystem.find(
      (f) => f.name === filePath && f.type === "file",
    );
    if (fileItem) {
      await handleOpenFile(fileItem);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim() || !directoryHandle) return;

    const fileNameWithExt = newFileName.endsWith(".json")
      ? newFileName.trim()
      : `${newFileName.trim()}.json`;

    try {
      let targetDir = directoryHandle;
      try {
        const original = await directoryHandle.getDirectoryHandle("original", {
          create: true,
        });
        const data = await original.getDirectoryHandle("data", {
          create: true,
        });
        targetDir = await data.getDirectoryHandle("ores", { create: true });
      } catch (e) {
        targetDir = directoryHandle;
      }

      const fileHandle = await targetDir.getFileHandle(fileNameWithExt, {
        create: true,
      });
      const writable = await fileHandle.createWritable();

      const initialData = {
        type: "ore",
        id: `custom:${newFileName}`,
        display: { name: newFileName, description: "" },
        worldSize: { width: 1, height: 1 },
        stats: { totalAmount: 100, drop: { items: [] } },
      };

      await writable.write(JSON.stringify(initialData, null, 2));
      await writable.close();

      const fullRelativeName = `original/data/ores/${fileNameWithExt}`;
      const newFileItem = {
        type: "file",
        name: fullRelativeName,
        handle: fileHandle,
      };

      setFileSystem((prev) => [...prev, newFileItem]);
      setActiveFile(fullRelativeName);
      setMockFormData({
        id: initialData.id,
        name: initialData.display.name,
        description: initialData.display.description,
        width: initialData.worldSize.width,
        height: initialData.worldSize.height,
        totalAmount: initialData.stats.totalAmount,
        dropId: "",
        dropCount: 1,
      });

      setNewFileName("");
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDir = async () => {
    if (!newDirName.trim() || !directoryHandle) return;

    try {
      const dirHandle = await directoryHandle.getDirectoryHandle(
        newDirName.trim(),
        { create: true },
      );
      setFileSystem((prev) => [
        ...prev,
        { type: "folder", name: newDirName.trim(), handle: dirHandle },
      ]);
      setNewDirName("");
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="editor-layout">
      <div className="editor-sidebar-container">
        <FileBrowser
          fileSystem={fileSystem}
          activeFile={activeFile}
          setActiveFile={handleSelectFile}
          setActiveModal={setActiveModal}
        />
        <div className="sidebar-footer">
          <button onClick={() => setView("dashboard")}>← На головну</button>
        </div>
      </div>

      <div className="editor-main-panel">
        <div className="panel-header">
          <span>Editing: {activeFile || "No file selected"}</span>
          {!autoSave && <button>💾 Save</button>}
        </div>

        <div className="panel-body">
          {editorMode === "object" ? (
            <div className="form-grid">
              <div className="form-card">
                <h4>Основна інформація руди</h4>
                <div className="form-group">
                  <label>Унікальний ID</label>
                  <input
                    type="text"
                    value={mockFormData.id}
                    onChange={(e) =>
                      setMockFormData({ ...mockFormData, id: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Назва руди</label>
                  <input
                    type="text"
                    value={mockFormData.name}
                    onChange={(e) =>
                      setMockFormData({ ...mockFormData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Опис руди</label>
                  <input
                    type="text"
                    value={mockFormData.description}
                    onChange={(e) =>
                      setMockFormData({
                        ...mockFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-card">
                <h4>Фізичні розміри & Спавн</h4>
                <div className="form-group">
                  <label>Ширина</label>
                  <input
                    type="number"
                    value={mockFormData.width}
                    onChange={(e) =>
                      setMockFormData({
                        ...mockFormData,
                        width: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Висота</label>
                  <input
                    type="number"
                    value={mockFormData.height}
                    onChange={(e) =>
                      setMockFormData({
                        ...mockFormData,
                        height: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Загальна місткість</label>
                  <input
                    type="number"
                    value={mockFormData.totalAmount}
                    onChange={(e) =>
                      setMockFormData({
                        ...mockFormData,
                        totalAmount: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-card">
                <h4>Налаштування дропу (Список)</h4>
                <div className="drop-item-row">
                  <div>
                    <label>ID предмету</label>
                    <input
                      type="text"
                      value={mockFormData.dropId}
                      onChange={(e) =>
                        setMockFormData({
                          ...mockFormData,
                          dropId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Кількість</label>
                    <input
                      type="number"
                      value={mockFormData.dropCount}
                      onChange={(e) =>
                        setMockFormData({
                          ...mockFormData,
                          dropCount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <button className="delete-btn">✕</button>
                </div>
                <button className="add-btn">
                  + Додати новий елемент списку
                </button>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              className="raw-json-textarea"
              value={JSON.stringify(
                {
                  type: "ore",
                  id: mockFormData.id,
                  display: {
                    name: mockFormData.name,
                    description: mockFormData.description,
                    sprite: null,
                  },
                  worldSize: {
                    width: mockFormData.width,
                    height: mockFormData.height,
                  },
                  stats: {
                    totalAmount: mockFormData.totalAmount,
                    drop: {
                      items: mockFormData.dropId
                        ? [
                            {
                              id: mockFormData.dropId,
                              count: mockFormData.dropCount,
                            },
                          ]
                        : [],
                    },
                  },
                },
                null,
                2,
              )}
            />
          )}
        </div>

        <div className="panel-footer">
          <button onClick={() => setEditorMode("object")}>
            🧩 ObjectEditor
          </button>
          <button onClick={() => setEditorMode("json")}>
            📄 RawJsonEditor
          </button>
        </div>
      </div>

      <Modal
        isOpen={activeModal === "file"}
        onClose={() => setActiveModal(null)}
        title="NewObjectFileModal"
      >
        <div>
          <label>Назва файлу</label>
          <input
            type="text"
            maxLength={24}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="наприклад, sulfur_ore"
          />
        </div>
        <div>
          <label>Шлях створення</label>
          <div className="modal-path-preview">
            original/data/ores/{newFileName || "<filename>"}.json
          </div>
        </div>
        <div>
          <label>Шаблон (Type)</label>
          <select>
            <option>ore (Шаблон руди)</option>
          </select>
        </div>
        <button onClick={handleCreateFile}>Створити / Enter</button>
      </Modal>

      <Modal
        isOpen={activeModal === "dir"}
        onClose={() => setActiveModal(null)}
        title="NewDirectoryModal"
      >
        <div>
          <label>Назва директорії</label>
          <input
            type="text"
            maxLength={24}
            value={newDirName}
            onChange={(e) => setNewDirName(e.target.value)}
            placeholder="наприклад, custom_ores"
          />
        </div>
        <div>
          <label>Шлях створення</label>
          <div className="modal-path-preview">
            original/data/ores/{newDirName || "<dirname>"}
          </div>
        </div>
        <button onClick={handleCreateDir}>Створити / Enter</button>
      </Modal>
    </div>
  );
}
