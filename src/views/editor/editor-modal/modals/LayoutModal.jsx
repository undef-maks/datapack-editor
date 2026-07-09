import { useTranslation } from "react-i18next";
import CustomSelect from "../../../../components/select/CustomSelect";

export default function LayoutModal({
  paths,
  modalInput,
  setModalInput,
  layoutList,
  onUpdateLayout,
  onClose,
}) {
  const { t } = useTranslation();

  const options = layoutList.map((l, index) => ({
    value: l.id || `layout-${index}`,
    title: l.info?.name || l.id || `Layout ${index + 1}`,
    description:
      l.info?.description || l.description || t("no_description_available"),
  }));

  const handleApply = async () => {
    if (Array.isArray(paths)) {
      for (const p of paths) {
        await onUpdateLayout(p, modalInput);
      }
    } else {
      await onUpdateLayout(paths, modalInput);
    }
    onClose();
  };

  return (
    <>
      <div className="file-info">
        <label>
          {paths.length > 1
            ? t("modal_label_files_multiple", "Target files:")
            : t("modal_label_file")}
        </label>
        {paths.length > 1 ? (
          <div
            className="modal-files-list-preview"
            style={{
              maxHeight: "100px",
              overflowY: "auto",
              background: "var(--button-hover)",
              padding: "6px",
              borderRadius: "4px",
              marginTop: "4px",
              fontSize: "12px",
            }}
          >
            {paths.map((p, idx) => (
              <div
                key={idx}
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                • {p}
              </div>
            ))}
          </div>
        ) : (
          <p>{paths[0]}</p>
        )}
      </div>

      <label style={{ marginTop: "12px", display: "block" }}>
        {t("modal_label_select_layout")}
      </label>

      <CustomSelect
        options={options}
        value={modalInput}
        onChange={(val) => setModalInput(val)}
        placeholder={t("modal_placeholder_select")}
      />

      <button onClick={handleApply} style={{ marginTop: "16px" }}>
        {t("modal_btn_apply")}
      </button>
    </>
  );
}
