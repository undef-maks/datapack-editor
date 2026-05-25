import { useState } from "react";
import Modal from "../../components/modal/Modal";
import "./Dashboard.css";

export default function Dashboard({ setView, setDirectoryHandle }) {
  const [activeModal, setActiveModal] = useState(null);
  const [error, setError] = useState("");

  const handleOpenDirectory = async () => {
    try {
      setError("");

      const dirHandle = await window.showDirectoryPicker();

      let hasManifest = false;
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file" && entry.name === "manifest.json") {
          hasManifest = true;
          break;
        }
      }

      if (!hasManifest) {
        setError("Помилка: У вибраній директорії немає файлу manifest.json");
        return;
      }

      setDirectoryHandle(dirHandle);
      setActiveModal(null);
      setView("datapack_editor");
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(
          "Не вдалося отримати доступ до папки. Перевірте дозволи браузера.",
        );
      }
    }
  };

  return (
    <div>
      <div>
        <h2>ГОЛОВНИЙ ЕКРАН</h2>
        <p>
          Оберіть дію для початку розробки контенту або конфігурації нових
          шаблонів ігор.
        </p>
      </div>

      <div>
        <button onClick={() => setActiveModal("pack")}>
          📦 Створити датапак
        </button>

        <button onClick={() => setActiveModal("open")}>
          📂 Відкрити датапак
        </button>

        <button onClick={() => setActiveModal("layout")}>
          🛠️ Створити шаблон гри
        </button>
      </div>

      <Modal
        isOpen={activeModal === "pack"}
        onClose={() => setActiveModal(null)}
        title="CreateDatapackModal"
      >
        <div>
          <label>2. Вибір гри</label>
          <select>
            <option>Undef Game 2</option>
            <option>World of Tanks 2D Retro</option>
          </select>
        </div>
        <div>
          <label>3. Шаблони датапаку</label>
          <select>
            <option>ore_layout (Шаблон руди)</option>
            <option>items_equipment_layout</option>
          </select>
        </div>
        <div>
          <label>4. Назва датапаку</label>
          <input type="text" maxLength={32} />
        </div>
        <div>
          <label>5. Іконка датапаку</label>
          <div>
            <div>No Img</div>
            <button>Завантажити свою</button>
          </div>
        </div>
        <div>
          <button onClick={() => setView("datapack_editor")}>
            6. Виконати (Вибір папки)
          </button>
          <button onClick={() => setActiveModal(null)}>7. Закрити</button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "layout"}
        onClose={() => setActiveModal(null)}
        title="CreateGameDatapackLayoutModal"
      >
        <div>
          <label>Вибір або назва гри</label>
          <input type="text" />
        </div>
        <div>
          <label>Назва шаблону</label>
          <input type="text" />
        </div>
        <div>
          <span>Налаштування компіляції</span>
          <label>
            <input type="checkbox" />
            Завантажувати всі .json в один файл
          </label>
          <label>
            <input type="checkbox" />
            Мінімізувати текстури (Збірка в атлас)
          </label>
        </div>
        <div>
          <button onClick={() => setView("layout_editor")}>Створити</button>
          <button onClick={() => setActiveModal(null)}>Повернутись</button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "open"}
        onClose={() => {
          setActiveModal(null);
          setError("");
        }}
        title="Відкрити датапак"
      >
        <div>
          <p>Оберіть робочу директорію проєкту на вашому комп'ютері.</p>

          {error && <p className="error-message">{error}</p>}

          <button onClick={handleOpenDirectory}>
            📁 Обрати папку на диску
          </button>
        </div>
      </Modal>
    </div>
  );
}
