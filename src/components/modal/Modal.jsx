import "./Modal.css";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
      }}
    >
      <div>
        <div>
          <h3>{title}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
