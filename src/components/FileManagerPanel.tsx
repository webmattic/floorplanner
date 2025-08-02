import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { Separator } from "./ui/separator.tsx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Plus,
  MoreVertical,
} from "lucide-react";
import axios from "axios";

// FileManagerPanel: shadcn UI for user file management (list/grid, upload, preview, delete)
const FileManagerPanel = ({ floorplanId }: { floorplanId: number }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/floorplanner/media/?floorplan=${floorplanId}`)
      .then((res) => setFiles(res.data))
      .finally(() => setLoading(false));
  }, [floorplanId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("original_filename", file.name);
    formData.append("floorplan", String(floorplanId));
    // Optionally set file_type
    formData.append("file_type", file.name.split(".").pop() || "");
    try {
      await axios.post("/api/floorplanner/media/", formData);
      // Refresh file list
      const res = await axios.get(
        `/api/floorplanner/media/?floorplan=${floorplanId}`
      );
      setFiles(res.data);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`/api/floorplanner/media/${id}/`);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Files</CardTitle>
          <label className="flex items-center cursor-pointer">
            <input
              type="file"
              accept=".dxf,.dwg,.pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button size="sm" variant="outline" disabled={uploading}>
              <Plus className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 p-2 rounded bg-gray-100 animate-pulse"
                >
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center flex-1 min-w-0"
                  >
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm">
                      {file.original_filename}
                    </span>
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={file.url} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(file.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground">
          Supported: .dxf, .dwg, .pdf, .jpg, .png
        </p>
      </CardContent>

      {/* File preview modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 h-96">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  {selectedFile.original_filename}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <iframe
                src={selectedFile.url}
                title="File Preview"
                className="w-full h-full border rounded"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default FileManagerPanel;
