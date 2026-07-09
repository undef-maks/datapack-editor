import { useModal } from "../../context/ModalContext";
import CreateProjectModal from "./modals/CreateProjectModal";
import OpenProjectModal from "./modals/OpenProjectModal";

export default function ModalManager({ setView, setDirectoryHandle }) {
  const { activeModal, closeModal } = useModal();

  return (
    <>
      <CreateProjectModal
        isOpen={activeModal === "pack"}
        onClose={closeModal}
        setView={setView}
        setDirectoryHandle={setDirectoryHandle}
      />
      <OpenProjectModal
        isOpen={activeModal === "open"}
        onClose={closeModal}
        setView={setView}
        setDirectoryHandle={setDirectoryHandle}
      />
    </>
  );
}
