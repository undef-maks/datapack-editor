import { IoFolderOutline, IoDocumentTextOutline } from "react-icons/io5";
import "./FileStructurePreview.css";

const TreeNode = ({ name, type, children, level = 0 }) => (
  <div style={{ paddingLeft: `${level * 16}px` }}>
    <div className="tree-node">
      {type === "folder" ? <IoFolderOutline /> : <IoDocumentTextOutline />}
      <span>{name}</span>
    </div>
    {children &&
      children.map((child, i) => (
        <TreeNode key={i} {...child} level={level + 1} />
      ))}
  </div>
);

export default function FileStructurePreview({ rootName, files }) {
  const buildTree = (flatList) => {
    const root = { name: rootName, type: "folder", children: [] };
    flatList.forEach((item) => {
      const parts = item.name.split("/");
      let current = root;
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            type: isLast && item.type === "file" ? "file" : "folder",
            children: [],
          };
          current.children.push(existing);
        }
        current = existing;
      });
    });
    return root;
  };

  const tree = buildTree(files);

  return (
    <div className="file-tree">
      {tree.children.map((child, i) => (
        <TreeNode key={i} {...child} level={0} />
      ))}
    </div>
  );
}
