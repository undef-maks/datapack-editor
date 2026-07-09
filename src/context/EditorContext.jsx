import { createContext, useContext } from "react";

const EditorContext = createContext();

export function EditorProvider({ children, value }) {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export const useEditor = () => useContext(EditorContext);
