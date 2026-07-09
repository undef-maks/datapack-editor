import { useTranslation } from "react-i18next";
import Modal from "../modal/Modal";

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  setSettings,
}) {
  const { i18n, t } = useTranslation();
  const { lang, theme, autoSave } = settings;

  const handleLangChange = (newLang) => {
    setSettings({ ...settings, lang: newLang });
    i18n.changeLanguage(newLang);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("settings_title")}>
      <div className="form-group">
        <label>{t("language_label")}</label>
        <select value={lang} onChange={(e) => handleLangChange(e.target.value)}>
          <option value="ua">Українська</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="form-group">
        <label>{t("theme_label")}</label>
        <select
          value={theme}
          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
        >
          <option value="dark">Core Dark (Carbon)</option>
          <option value="amoled">Amoled Black</option>
          <option value="light">Light Mode</option>
        </select>
      </div>

      <div className="form-group">
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) =>
              setSettings({ ...settings, autoSave: e.target.checked })
            }
          />
          {t("autosave_label")}
        </label>
      </div>
    </Modal>
  );
}
