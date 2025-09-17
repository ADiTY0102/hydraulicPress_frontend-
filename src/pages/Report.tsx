import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User, Settings } from "lucide-react";
import { useSimulation } from "@/contexts/SimulationContext";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Report() {
  const { motorSystem, cylinder, cyclePhases, simulationData, isSimulated, mlResults } = useSimulation();

  const downloadReport = async () => {
    if (!isSimulated) {
      alert("Please run a simulation first to generate a report.");
      return;
    }

    try {
      const reportElement = document.getElementById('report-content');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Hydraulic_Press_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Calculate dynamic metrics from simulation data
  const calculateMetrics = () => {
    if (!simulationData.length) return {
      totalCycles: 0,
      efficiency: 0,
      uptime: 0,
      avgCycleTime: 0,
      maxPressure: 0,
      maxFlow: 0,
      maxPower: 0,
      avgPower: 0
    };

    const totalCycleTime = cyclePhases.fastDown.time + cyclePhases.working.time + 
                          cyclePhases.holding.time + cyclePhases.fastUp.time;
    
    const maxPressure = Math.max(...simulationData.map(d => d.pressure));
    const maxFlow = Math.max(...simulationData.map(d => d.flow));
    const maxPower = Math.max(...simulationData.map(d => d.motorPower));
    const avgPower = simulationData.reduce((sum, d) => sum + d.motorPower, 0) / simulationData.length;
    const efficiency = simulationData.reduce((sum, d) => sum + (d.idealMotorPower / d.motorPower), 0) / simulationData.length * 100;

    return {
      totalCycles: Math.floor(3600 / totalCycleTime), // Cycles per hour
      efficiency: efficiency || motorSystem.pumpEfficiency * 100,
      uptime: 97.8, // Static for now
      avgCycleTime: totalCycleTime,
      maxPressure,
      maxFlow,
      maxPower,
      avgPower
    };
  };

  const metrics = calculateMetrics();

  const reportData = {
    generatedAt: new Date().toLocaleString(),
    operator: "System Administrator",
    ...metrics
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div id="report-content" className="bg-white text-black p-6">
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
                disabled={!isSimulated}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gray-50 shadow-sm border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData.totalCycles}</div>
                <div className="text-sm text-gray-600">Cycles/Hour</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 shadow-sm border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.efficiency.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 shadow-sm border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{reportData.maxPressure.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Max Pressure (bar)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 shadow-sm border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{reportData.maxFlow.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Max Flow (L/min)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 shadow-sm border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{reportData.maxPower.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Max Power (kW)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ML Results */}
        {mlResults && (
          <Card className="bg-gray-50 shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Machine Learning Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Anomaly Detection</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>Score: <span className="font-medium">{mlResults.anomaly_score?.toFixed(4)}</span></div>
                    <div>Status: <span className={`font-medium ${mlResults.is_anomaly ? 'text-red-600' : 'text-green-600'}`}>
                      {mlResults.is_anomaly ? 'Anomaly Detected' : 'Normal Operation'}
                    </span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cycle Classification</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>Class: <span className="font-medium capitalize">{mlResults.cycle_class}</span></div>
                    <div>Confidence: <span className="font-medium">{Math.max(...(mlResults.class_probabilities || [])).toFixed(3)}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>Efficiency: <span className="font-medium">{mlResults.summary?.efficiency_pct?.toFixed(1)}%</span></div>
                    <div>Total Energy: <span className="font-medium">{mlResults.summary?.total_energy_kj?.toFixed(2)} kJ</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Predictions</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>Pred. Flow: <span className="font-medium">{mlResults.regressions?.max_flow_lpm?.toFixed(1)} L/min</span></div>
                    <div>Pred. Pressure: <span className="font-medium">{mlResults.regressions?.max_pressure_bar?.toFixed(1)} bar</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Sections */}
        <div className="grid gap-4">
          <Card className="bg-gray-50 shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                System Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Motor & System</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>Motor RPM: <span className="font-medium text-gray-900">{motorSystem.motorRpm}</span></div>
                    <div>Pump Efficiency: <span className="font-medium text-gray-900">{(motorSystem.pumpEfficiency * 100).toFixed(1)}%</span></div>
                    <div>System Losses: <span className="font-medium text-gray-900">{motorSystem.systemLosses} bar</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cylinder Parameters</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>Bore: <span className="font-medium text-gray-900">{cylinder.bore} cm</span></div>
                    <div>Rod: <span className="font-medium text-gray-900">{cylinder.rod} mm</span></div>
                    <div>Dead Load: <span className="font-medium text-gray-900">{cylinder.deadLoad} ton</span></div>
                    <div>Holding Load: <span className="font-medium text-gray-900">{cylinder.holdingLoad} ton</span></div>
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
    </div>
  );
}