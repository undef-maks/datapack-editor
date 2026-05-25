import { useState } from "react";

export default function GameLayoutEditor({ setView }) {
  const [layoutMode, setLayoutMode] = useState("object");

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: "20%" }}>
        <div>
          <span>🛠️ LayoutFileBrowser</span>
          <div>📁 layouts/</div>
          <div style={{ color: "orange" }}>ore_layout.json</div>
          <div>item_layout.json</div>
        </div>
        <button onClick={() => setView("dashboard")}>← На головну</button>
      </aside>

      <section style={{ width: "80%" }}>
        <div>
          <span>Шаблонізатор: ore_layout</span>
        </div>

        <div>
          {layoutMode === "object" ? (
            <div>
              <div>
                <h4>LayoutObjectEditor</h4>
                <button>+ Додати нове поле</button>
              </div>

              <div>
                <div>
                  <span>$ref.oreIdInput</span>
                  <span>Тип: string | Категорія: Основна інформація</span>
                </div>
                <div>
                  <span>$ref.worldWidthInput</span>
                  <span>Тип: integer | Категорія: Розміри</span>
                </div>
                <div>
                  <span>$ref.oreDropList</span>
                  <span>Тип: list [id, count] | Категорія: Характеристики</span>
                </div>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              style={{
                width: "100%",
                height: "300px",
                fontFamily: "monospace",
              }}
              value={JSON.stringify(
                {
                  type: "layout",
                  id: "ore_layout",
                  path: "original/data/ores/*",
                  structure: { type: "ore", id: "${ref.oreIdInput}" },
                  refs: {
                    categories: [
                      {
                        title: "Основна інформація руди",
                        options: [{ id: "oreIdInput", type: "string" }],
                      },
                    ],
                  },
                },
                null,
                2,
              )}
            />
          )}
        </div>

        <div>
          <button onClick={() => setLayoutMode("object")}>
            🧩 LayoutObjectEditor
          </button>
          <button onClick={() => setLayoutMode("json")}>
            📄 LayoutRawJsonEditor
          </button>
        </div>
      </section>
    </div>
  );
}
