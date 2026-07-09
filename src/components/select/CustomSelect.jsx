import { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`custom-select ${isOpen ? "open" : ""}`} ref={containerRef}>
      <div className="select-header" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? (
          <div>
            <div className="select-title">{selectedOption.title}</div>
            <div className="select-desc">{selectedOption.description}</div>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <span
          className="arrow"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`select-item ${value === opt.value ? "active" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <div className="select-title">{opt.title}</div>
              <div className="select-desc">{opt.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
