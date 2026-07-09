import { useTranslation } from "react-i18next";
import CustomSelect from "../../../../components/select/CustomSelect";

export default function CreateModal({
  type,
  path,
  modalInput,
  setModalInput,
  layoutList,
  onCreate,
}) {
  const { t } = useTranslation();
  const isFolder = type === "folder";

  const templateOptions = [
    { value: "", title: t("modal_option_no_template"), description: "" },
    ...layoutList.map((l) => ({
      value: l.id,
      title: l.id,
      description: l.description || t("no_description_available"),
    })),
  ];

  return (
    <>
      <div className="file-info">
        <label>{t("modal_label_path")}</label>
        <p>{path}</p>
      </div>

      <label>{t("modal_label_name")}</label>
      <input
        value={modalInput.split("|")[0]}
        onChange={(e) =>
          setModalInput(e.target.value + "|" + (modalInput.split("|")[1] || ""))
        }
        placeholder={t("modal_placeholder_name")}
      />

      {!isFolder && (
        <>
          <label>{t("modal_label_template")}</label>
          <CustomSelect
            options={templateOptions}
            value={modalInput.split("|")[1] || ""}
            onChange={(val) =>
              setModalInput(modalInput.split("|")[0] + "|" + val)
            }
            placeholder={t("modal_placeholder_select")}
          />
        </>
      )}

      <button
        onClick={() => {
          const [n, l] = modalInput.split("|");
          onCreate(n, path, l);
        }}
      >
        {t("modal_btn_create")}
      </button>
    </>
  );
}
