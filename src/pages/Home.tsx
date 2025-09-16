import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  RotateCw, 
  Clock, 
  FileText, 
  Settings,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import hydraulicBackground from "@/assets/hydraulic-background.jpg";

const navigationButtons = [
  {
    title: "Shift",
    description: "Shift operations and scheduling",
    icon: RotateCw,
    path: "/shift",
    color: "hydraulic-primary"
  },
  {
    title: "Auto",
    description: "Automated process control",
    icon: Play,
    path: "/auto",
    color: "hydraulic-secondary"
  },
  {
    title: "Counter & Cycle Time",
    description: "Production counters and timing",
    icon: Clock,
    path: "/simulation",
    color: "hydraulic-success"
  },
  {
    title: "Electronic Drawing",
    description: "Electronic circuit diagrams",
    icon: FileText,
    path: "/electronic-drawing",
    color: "hydraulic-warning"
  },
  {
    title: "Hydraulic Drawing", 
    description: "Hydraulic system schematics",
    icon: Settings,
    path: "/hydraulic-drawing",
    color: "hydraulic-primary"
  },
  {
    title: "Hydraulic Graph",
    description: "Performance analytics and graphs",
    icon: TrendingUp,
    path: "/simulation",
    color: "hydraulic-secondary"
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(34, 40, 49, 0.85), rgba(34, 40, 49, 0.85)), url(${hydraulicBackground})`
      }}
    >
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hydraulic Press Monitoring
            <span className="block text-hydraulic-primary mt-2">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional monitoring and control system for hydraulic press operations
          </p>
        </div>

        {/* File Upload Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">
            System Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationButtons.map((button, index) => (
              <Card 
                key={index}
                className="bg-card/90 backdrop-blur-sm border border-border hover:border-hydraulic-primary transition-smooth cursor-pointer shadow-card hover:shadow-hydraulic"
                onClick={() => handleNavigation(button.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-hydraulic flex items-center justify-center`}>
                      <button.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{button.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{button.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-hydraulic-primary text-hydraulic-primary hover:bg-hydraulic-primary hover:text-white transition-smooth"
                  >
                    Access Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            Industrial Hydraulic Press Monitoring System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}