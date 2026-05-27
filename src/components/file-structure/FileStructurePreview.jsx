import {
  IoFolderOutline,
  IoDocumentTextOutline,
  IoChevronForward,
} from "react-icons/io5";
import "./FileStructurePreview.css";

export default function FileStructurePreview({ rootName, files }) {
  return (
    <div className="file-tree">
      <div className="tree-node">
        <IoFolderOutline /> <span>{rootName}</span>
      </div>
      <div className="tree-children">
        {files.map((file, index) => (
          <div key={index} className="tree-node">
            {file.type === "folder" ? (
              <IoFolderOutline />
            ) : (
              <IoDocumentTextOutline />
            )}
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
