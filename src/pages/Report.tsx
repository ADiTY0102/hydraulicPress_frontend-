import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User, Settings } from "lucide-react";
import { useSimulation } from "@/contexts/SimulationContext";

export default function Report() {
  const { motorSystem, cylinder, cyclePhases, simulationData, isSimulated } = useSimulation();

  const downloadReport = () => {
    if (!isSimulated) {
      alert("Please run a simulation first to generate a report.");
      return;
    }

    // Create comprehensive CSV report
    const reportData = [
      "Hydraulic Press Simulation Report",
      `Generated on: ${new Date().toLocaleString()}`,
      "",
      "=== MOTOR & SYSTEM PARAMETERS ===",
      `Motor RPM: ${motorSystem.motorRpm}`,
      `Pump Efficiency: ${motorSystem.pumpEfficiency}`,
      `System Losses (bar): ${motorSystem.systemLosses}`,
      "",
      "=== CYLINDER PARAMETERS ===",
      `Bore (cm): ${cylinder.bore}`,
      `Rod (mm): ${cylinder.rod}`,
      `Dead Load (ton): ${cylinder.deadLoad}`,
      `Holding Load (ton): ${cylinder.holdingLoad}`,
      "",
      "=== CYCLE PHASES ===",
      `Fast Down - Speed: ${cyclePhases.fastDown.speed} mm/s, Stroke: ${cyclePhases.fastDown.stroke} mm, Time: ${cyclePhases.fastDown.time} s`,
      `Working - Speed: ${cyclePhases.working.speed} mm/s, Stroke: ${cyclePhases.working.stroke} mm, Time: ${cyclePhases.working.time} s`,
      `Holding - Time: ${cyclePhases.holding.time} s`,
      `Fast Up - Speed: ${cyclePhases.fastUp.speed} mm/s, Stroke: ${cyclePhases.fastUp.stroke} mm, Time: ${cyclePhases.fastUp.time} s`,
      "",
      "=== SIMULATION RESULTS ===",
      "Time,Stroke,Speed,Flow,Pressure,HydraulicPower,MotorPower,IdealMotorPower,SwashplateAngle",
      ...simulationData.map(row => 
        `${row.time.toFixed(2)},${row.stroke.toFixed(2)},${row.speed.toFixed(2)},${row.flow.toFixed(2)},${row.pressure.toFixed(2)},${row.hydraulicPower.toFixed(2)},${row.motorPower.toFixed(2)},${row.idealMotorPower.toFixed(2)},${row.swashplateAngle.toFixed(2)}`
      )
    ].join('\n');

    const blob = new Blob([reportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hydraulic_press_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
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
                    <div className="text-sm text-muted-foreground">Motor RPM: <span className="text-foreground">{motorSystem.motorRpm}</span></div>
                    <div className="text-sm text-muted-foreground">Pump Efficiency: <span className="text-foreground">{(motorSystem.pumpEfficiency * 100).toFixed(1)}%</span></div>
                    <div className="text-sm text-muted-foreground">System Losses: <span className="text-foreground">{motorSystem.systemLosses} bar</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Cylinder Parameters</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="text-sm text-muted-foreground">Bore: <span className="text-foreground">{cylinder.bore} cm</span></div>
                    <div className="text-sm text-muted-foreground">Rod: <span className="text-foreground">{cylinder.rod} mm</span></div>
                    <div className="text-sm text-muted-foreground">Dead Load: <span className="text-foreground">{cylinder.deadLoad} ton</span></div>
                    <div className="text-sm text-muted-foreground">Holding Load: <span className="text-foreground">{cylinder.holdingLoad} ton</span></div>
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
                  <Badge 
                    variant={isSimulated ? "default" : "secondary"} 
                    className={`${isSimulated ? "bg-hydraulic-success/20 text-hydraulic-success border-hydraulic-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {isSimulated ? "Data Available" : "Run Simulation First"}
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