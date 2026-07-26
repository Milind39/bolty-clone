import JSZip from "jszip";

interface FileItem {
  path: string;
  content: string;
}

export async function downloadProjectZip(files: FileItem[], projectName: string = "Bolty.old") {
  const zip = new JSZip();

// Create a subfolder inside the zip named after the project
  const rootFolder = zip.folder(projectName);

  if (!rootFolder) {
    throw new Error("Failed to create root folder in ZIP archive.");
  }

  // Add each file inside the root folder
  files.forEach((file) => {
    // Clean up leading slashes to prevent relative path resolution issues
    let relativePath = file.path.startsWith("/") ? file.path.slice(1) : file.path;
    
    // Write file into the root project folder structure
    rootFolder.file(relativePath, file.content || "");
  });

  // Generate the zip file blob
  const content = await zip.generateAsync({ type: "blob" });

  // Create a temporary anchor element to trigger the browser download
  const url = window.URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}