import { useState } from "react";

export const useEditorModal = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalInput, setModalInput] = useState("");
  const [focusedNode, setFocusedNode] = useState(null);
  const [renamingNodePath, setRenamingNodePath] = useState(null);
  const [creatingNodePath, setCreatingNodePath] = useState(null);
  const [creatingNodeType, setCreatingNodeType] = useState(null);
  return {
    activeModal,
    setActiveModal,
    setModal: setActiveModal,
    modalInput,
    setModalInput,
    focusedNode,
    setFocusedNode,
    renamingNodePath,
    setRenamingNodePath,

    creatingNodePath,
    setCreatingNodePath,
    creatingNodeType,
    setCreatingNodeType,
  };
};
