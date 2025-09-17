import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSimulation } from "@/contexts/SimulationContext";
import { AlertCircle, CheckCircle, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MLResponse {
  anomaly_score: number;
  anomaly_threshold: number;
  class_probabilities: number[];
  cycle_class: string;
  derived: {
    max_power_kw: number;
  };
  is_anomaly: boolean;
  phase_summary: any;
  regressions: any;
  summary: any;
}

export default function Summary() {
  const { simulationData, isSimulated, motorSystem, cylinder, cyclePhases } = useSimulation();
  const [mlResults, setMlResults] = useState<MLResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMaxValues = () => {
    if (!simulationData.length) return null;

    const maxPressure = Math.max(...simulationData.map(d => d.pressure));
    const maxFlow = Math.max(...simulationData.map(d => d.flow));
    const maxSpeed = Math.max(...simulationData.map(d => d.speed));
    const maxPower = Math.max(...simulationData.map(d => d.motorPower));

    return { maxPressure, maxFlow, maxSpeed, maxPower };
  };

  const runMLAnalysis = async () => {
    if (!isSimulated || !simulationData.length) {
      toast.error("Please run simulation first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const maxValues = calculateMaxValues();
      if (!maxValues) throw new Error("No simulation data available");

      const payload = {
        bore_cm: cylinder.bore,
        rod_mm: cylinder.rod,
        dead_load_ton: cylinder.deadLoad,
        hold_load_ton: cylinder.holdingLoad,
        motor_rpm: motorSystem.motorRpm,
        pump_eff: motorSystem.pumpEfficiency,
        system_loss_bar: motorSystem.systemLosses,
        fast_down: cyclePhases.fastDown,
        working: cyclePhases.working,
        holding: cyclePhases.holding,
        fast_up: cyclePhases.fastUp,
        max_pressure_bar: maxValues.maxPressure,
        max_flow_lpm: maxValues.maxFlow,
        max_speed_mms: maxValues.maxSpeed,
        max_power_kw: maxValues.maxPower,
        simulation_data: simulationData
      };

      const response = await fetch('http://127.0.0.1:5000/api/run-ml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MLResponse = await response.json();
      setMlResults(data);
      toast.success("ML analysis completed successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to ML service";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">System Analysis Summary</h1>
        <p className="text-muted-foreground">Machine Learning analysis and anomaly detection results</p>
      </div>

      {/* Run Analysis Button */}
      <div className="mb-6">
        <Button
          onClick={runMLAnalysis}
          disabled={!isSimulated || isLoading}
          className="bg-gradient-hydraulic hover:opacity-90 text-white font-medium transition-smooth"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Analyzing..." : "Run ML Analysis"}
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-hydraulic-danger bg-hydraulic-danger/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-hydraulic-danger">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {!isSimulated && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please run the simulation first to generate data for ML analysis.
          </AlertDescription>
        </Alert>
      )}

      {mlResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anomaly Detection */}
          <Card className="bg-card shadow-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mlResults.is_anomaly ? (
                  <AlertCircle className="w-5 h-5 text-hydraulic-danger" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-hydraulic-success" />
                )}
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge
                  variant={mlResults.is_anomaly ? "destructive" : "default"}
                  className={mlResults.is_anomaly ? 
                    "bg-hydraulic-danger text-white" : 
                    "bg-hydraulic-success text-white"
                  }
                >
                  {mlResults.is_anomaly ? "Anomaly Detected" : "Normal Operation"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Anomaly Score:</span>
                <span className="font-mono text-sm">{mlResults.anomaly_score.toFixed(4)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Threshold:</span>
                <span className="font-mono text-sm">{mlResults.anomaly_threshold.toFixed(4)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cycle Classification */}
          <Card className="bg-card shadow-card border border-border">
            <CardHeader>
              <CardTitle>Cycle Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cycle Class:</span>
                <Badge
                  variant="outline"
                  className="border-hydraulic-primary text-hydraulic-primary"
                >
                  {mlResults.cycle_class}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Class Probabilities:</span>
                {mlResults.class_probabilities.map((prob, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Class {index + 1}:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hydraulic-primary rounded-full"
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Derived Metrics */}
          <Card className="bg-card shadow-card border border-border">
            <CardHeader>
              <CardTitle>Derived Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Power (kW):</span>
                <span className="font-mono text-sm font-semibold">
                  {mlResults.derived.max_power_kw.toFixed(3)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* System Summary */}
          {mlResults.summary && (
            <Card className="bg-card shadow-card border border-border">
              <CardHeader>
                <CardTitle>System Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efficiency:</span>
                    <span className="font-mono">{mlResults.summary.efficiency_pct?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Flow:</span>
                    <span className="font-mono">{mlResults.summary.max_flow_lpm?.toFixed(2)} L/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Pressure:</span>
                    <span className="font-mono">{mlResults.summary.max_pressure_bar?.toFixed(1)} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Energy:</span>
                    <span className="font-mono">{mlResults.summary.total_energy_kj?.toFixed(2)} kJ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}