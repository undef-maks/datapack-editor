import { useMemo } from "react";

export const useTreeBuilder = (fileSystem) => {
  return useMemo(() => {
    const root = { name: "root", type: "folder", children: [], path: "" };
    fileSystem.forEach((item) => {
      const parts = item.name.split("/");
      let current = root;
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            type: isLast && item.type === "file" ? "file" : "folder",
            path: item.name,
            children: [],
            hasLayout: item.hasLayout,
          };
          current.children.push(existing);
        }
        current = existing;
      });
    });
    return root.children;
  }, [fileSystem]);
};
