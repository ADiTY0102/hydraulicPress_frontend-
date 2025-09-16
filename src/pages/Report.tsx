import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User, Settings } from "lucide-react";

export default function Report() {
  const downloadReport = () => {
    // Mock report download functionality
    console.log("Downloading comprehensive report...");
  };

  const reportData = {
    generatedAt: new Date().toLocaleString(),
    operator: "System Administrator",
    totalCycles: 1250,
    efficiency: 94.2,
    uptime: 97.8,
    avgCycleTime: 12.5,
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">System Report</h1>
        <p className="text-muted-foreground">Comprehensive analysis and performance metrics</p>
      </div>

      <div className="grid gap-6">
        {/* Report Header */}
        <Card className="bg-card shadow-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-hydraulic rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Hydraulic Press Performance Report</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{reportData.generatedAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{reportData.operator}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={downloadReport}
                className="bg-hydraulic-primary hover:bg-hydraulic-primary/90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card shadow-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-hydraulic-primary">{reportData.totalCycles}</div>
                <div className="text-sm text-muted-foreground">Total Cycles</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-hydraulic-success">{reportData.efficiency}%</div>
                <div className="text-sm text-muted-foreground">Efficiency</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-hydraulic-secondary">{reportData.uptime}%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-hydraulic-warning">{reportData.avgCycleTime}s</div>
                <div className="text-sm text-muted-foreground">Avg Cycle Time</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Sections */}
        <div className="grid gap-4">
          <Card className="bg-card shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-hydraulic-primary" />
                System Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Motor & System</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Motor RPM: <span className="text-foreground">1800</span></div>
                    <div>Pump Efficiency: <span className="text-foreground">90%</span></div>
                    <div>System Losses: <span className="text-foreground">10 bar</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Cylinder Parameters</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Bore: <span className="text-foreground">25 cm</span></div>
                    <div>Rod: <span className="text-foreground">60 mm</span></div>
                    <div>Dead Load: <span className="text-foreground">2 ton</span></div>
                    <div>Holding Load: <span className="text-foreground">8 ton</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Overall System Health</span>
                  <Badge className="bg-hydraulic-success/20 text-hydraulic-success border-hydraulic-success">
                    Excellent
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Energy Efficiency</span>
                  <Badge className="bg-hydraulic-primary/20 text-hydraulic-primary border-hydraulic-primary">
                    Optimized
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Maintenance Status</span>
                  <Badge className="bg-hydraulic-warning/20 text-hydraulic-warning border-hydraulic-warning">
                    Scheduled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-hydraulic-success mt-2"></div>
                  <div>
                    <h4 className="font-medium text-foreground">System Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Current performance levels are within optimal range. Continue monitoring cycle times.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-hydraulic-warning mt-2"></div>
                  <div>
                    <h4 className="font-medium text-foreground">Maintenance Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      Hydraulic fluid replacement due in 150 operating hours. Schedule preventive maintenance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-hydraulic-primary mt-2"></div>
                  <div>
                    <h4 className="font-medium text-foreground">Energy Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider implementing variable speed drive for 5-8% energy savings during low-load periods.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}