import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large", 
        description: "File size should be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
    toast({
      title: "File Uploaded",
      description: `Successfully uploaded ${file.name}`,
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="bg-card shadow-card border border-border">
      <CardContent className="p-6">
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-smooth
            ${dragActive 
              ? "border-hydraulic-primary bg-hydraulic-primary/10" 
              : "border-border hover:border-hydraulic-secondary hover:bg-muted/50"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".csv"
            onChange={handleFileSelect}
          />
          
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-hydraulic-success" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-hydraulic-secondary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Upload CSV File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Button variant="outline" className="border-hydraulic-primary text-hydraulic-primary hover:bg-hydraulic-primary hover:text-white">
                  Browse Files
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}