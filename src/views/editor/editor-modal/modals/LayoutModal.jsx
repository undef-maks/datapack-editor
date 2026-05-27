import { useTranslation } from "react-i18next";
import CustomSelect from "../../../../components/select/CustomSelect";

export default function LayoutModal({
  path,
  modalInput,
  setModalInput,
  layoutList,
  onUpdateLayout,
}) {
  const { t } = useTranslation();

  // Форматуємо список для CustomSelect
  const options = layoutList.map((l) => ({
    value: l.id,
    title: l.id,
    description: l.description || t("no_description_available"),
  }));

  return (
    <>
      <div className="file-info">
        <label>{t("modal_label_file")}</label>
        <p>{path}</p>
      </div>

      <label>{t("modal_label_select_layout")}</label>

      <CustomSelect
        options={options}
        value={modalInput}
        onChange={(val) => setModalInput(val)}
        placeholder={t("modal_placeholder_select")}
      />

      <button onClick={() => onUpdateLayout(path, modalInput)}>
        {t("modal_btn_apply")}
      </button>
    </>
  );
}
