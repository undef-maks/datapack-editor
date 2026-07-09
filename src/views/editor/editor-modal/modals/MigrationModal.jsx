import { useState } from "react";
import CustomSelect from "../../../../components/select/CustomSelect";

export default function MigrationModal({
  paths,
  migrationList,
  onApply,
  onClose,
}) {
  const [selectedMigration, setSelectedMigration] = useState(null);

  const options = migrationList.map((m) => ({
    value: m.path,
    title: m.path.split("/").pop(),
    description: `Apply: ${m.path}`,
  }));

  const handleApply = () => {
    if (selectedMigration) {
      onApply(paths, selectedMigration);
      onClose();
    }
  };

  return (
    <>
      <div className="file-info">
        <label>Selected {paths.length} files:</label>
        <div
          style={{
            background: "var(--button-hover)",
            padding: "6px",
            borderRadius: "4px",
            fontSize: "12px",
            maxHeight: "100px",
            overflowY: "auto",
          }}
        >
          {paths.map((p, i) => (
            <div key={i}>• {p.split("/").pop()}</div>
          ))}
        </div>
      </div>

      <label style={{ marginTop: "12px", display: "block" }}>
        Select Migration:
      </label>
      <CustomSelect
        options={options}
        value={selectedMigration}
        onChange={(val) => setSelectedMigration(val)}
        placeholder="Choose a migration..."
      />

      <button onClick={handleApply} style={{ marginTop: "16px" }}>
        Run Migration
      </button>
    </>
  );
}
