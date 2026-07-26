import React, { useState } from "react";
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Download,
  FolderIcon,
  FileTextIcon,
} from "lucide-react";
import { FileItem } from "../types";
import { downloadProjectZip } from "@/utils/downloadProject";

interface FileExplorerProps {
  files: FileItem[]; // Tree structure for the UI tree view
  flatFiles: Array<{ path: string; content: string }>; // Flat array for zip bundling
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

function FileNode({ item, depth, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={handleClick}
      >
        {item.type === "folder" && (
          <span className="text-gray-400">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {item.type === "folder" ? (
          <FolderIcon className="w-4 h-4 text-blue-400" />
        ) : (
          <FileTextIcon className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-gray-200">{item.name}</span>
      </div>
      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  files,
  flatFiles,
  onFileSelect,
}: FileExplorerProps) {
  const handleDownload = async () => {
    if (!flatFiles || flatFiles.length === 0) {
      alert("No files available to download yet!");
      return;
    }
    await downloadProjectZip(flatFiles, "my-bolty-app");
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
          <FolderTree className="w-5 h-5" />
          File Explorer
        </h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="Download Project as ZIP"
        >
          <Download size={14} />
          <span>Download</span>
        </button>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
