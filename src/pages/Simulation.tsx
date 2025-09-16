import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Download, Play } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useSimulation } from "@/contexts/SimulationContext";

const GraphCard = ({ title, dataKey, color, unit }: { title: string; dataKey: string; color: string; unit: string }) => {
  const { simulationData, isSimulated } = useSimulation();

  const downloadPNG = () => {
    // Create CSV data for download
    const csvContent = simulationData.map(row => 
      `${row.time},${row[dataKey as keyof typeof row]}`
    ).join('\n');
    const blob = new Blob([`Time,${title}\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const downloadCSV = () => {
    downloadPNG(); // Same as PNG for now - CSV download
  };

  return (
    <Card className="bg-card shadow-card border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPNG}
            className="h-7 px-2 text-xs border-hydraulic-primary text-hydraulic-primary hover:bg-hydraulic-primary hover:text-white"
          >
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            className="h-7 px-2 text-xs border-hydraulic-secondary text-hydraulic-secondary hover:bg-hydraulic-secondary hover:text-white"
          >
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={isSimulated ? simulationData : []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Time (s) vs {title} ({unit})
        </div>
      </CardContent>
    </Card>
  );
};

export default function Simulation() {
  const { 
    motorSystem, 
    setMotorSystem, 
    cylinder, 
    setCylinder, 
    cyclePhases, 
    setCyclePhases, 
    runSimulation,
    isSimulated 
  } = useSimulation();

  const [isMotorOpen, setIsMotorOpen] = useState(true);
  const [isCylinderOpen, setIsCylinderOpen] = useState(true);
  const [isCycleOpen, setIsCycleOpen] = useState(true);

  const graphs = [
    { title: "Stroke vs Time", dataKey: "stroke", color: "hsl(var(--hydraulic-success))", unit: "mm" },
    { title: "Speed vs Time", dataKey: "speed", color: "hsl(var(--hydraulic-primary))", unit: "mm/s" },
    { title: "Flow vs Time", dataKey: "flow", color: "hsl(var(--hydraulic-secondary))", unit: "L/min" },
    { title: "Pressure vs Time", dataKey: "pressure", color: "hsl(var(--hydraulic-warning))", unit: "bar" },
    { title: "Hydraulic Power vs Time", dataKey: "hydraulicPower", color: "hsl(var(--hydraulic-danger))", unit: "kW" },
    { title: "Motor Power vs Time", dataKey: "motorPower", color: "hsl(var(--hydraulic-primary))", unit: "kW" },
    { title: "Ideal Motor Input Power vs Time", dataKey: "idealMotorPower", color: "hsl(var(--hydraulic-secondary))", unit: "kW" },
    { title: "Swashplate Angle vs Time", dataKey: "swashplateAngle", color: "hsl(var(--accent))", unit: "degrees" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Hydraulic Press Simulation</h1>
        <p className="text-muted-foreground">Configure parameters and analyze system performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Parameters Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Motor & System Parameters */}
          <Collapsible open={isMotorOpen} onOpenChange={setIsMotorOpen}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer hover:shadow-card transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">▼ Motor & System</CardTitle>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMotorOpen ? "rotate-180" : ""}`} />
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="motorRpm" className="text-xs">Motor RPM</Label>
                    <Input
                      id="motorRpm"
                      type="number"
                      value={motorSystem.motorRpm}
                      onChange={(e) => setMotorSystem({...motorSystem, motorRpm: parseInt(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pumpEfficiency" className="text-xs">Pump Efficiency</Label>
                    <Input
                      id="pumpEfficiency"
                      type="number"
                      step="0.1"
                      value={motorSystem.pumpEfficiency}
                      onChange={(e) => setMotorSystem({...motorSystem, pumpEfficiency: parseFloat(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="systemLosses" className="text-xs">System Losses (bar)</Label>
                    <Input
                      id="systemLosses"
                      type="number"
                      value={motorSystem.systemLosses}
                      onChange={(e) => setMotorSystem({...motorSystem, systemLosses: parseInt(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Cylinder Parameters */}
          <Collapsible open={isCylinderOpen} onOpenChange={setIsCylinderOpen}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer hover:shadow-card transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">▼ Cylinder Parameters</CardTitle>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCylinderOpen ? "rotate-180" : ""}`} />
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="bore" className="text-xs">Bore (cm)</Label>
                    <Input
                      id="bore"
                      type="number"
                      value={cylinder.bore}
                      onChange={(e) => setCylinder({...cylinder, bore: parseInt(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rod" className="text-xs">Rod (mm)</Label>
                    <Input
                      id="rod"
                      type="number"
                      value={cylinder.rod}
                      onChange={(e) => setCylinder({...cylinder, rod: parseInt(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadLoad" className="text-xs">Dead Load (ton)</Label>
                    <Input
                      id="deadLoad"
                      type="number"
                      value={cylinder.deadLoad}
                      onChange={(e) => setCylinder({...cylinder, deadLoad: parseInt(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="holdingLoad" className="text-xs">Holding Load (ton)</Label>
                    <Input
                      id="holdingLoad"
                      type="number"
                      value={cylinder.holdingLoad}
                      onChange={(e) => setCylinder({...cylinder, holdingLoad: parseInt(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Cycle Phases */}
          <Collapsible open={isCycleOpen} onOpenChange={setIsCycleOpen}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer hover:shadow-card transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">▼ Cycle Phases</CardTitle>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCycleOpen ? "rotate-180" : ""}`} />
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="pt-4 space-y-6">
                  {/* Fast Down */}
                  <div>
                    <h4 className="text-xs font-medium text-hydraulic-primary mb-2">Fast Down</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Speed (mm/s)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.fastDown.speed}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            fastDown: {...cyclePhases.fastDown, speed: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Stroke (mm)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.fastDown.stroke}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            fastDown: {...cyclePhases.fastDown, stroke: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Time (s)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.fastDown.time}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            fastDown: {...cyclePhases.fastDown, time: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Working */}
                  <div>
                    <h4 className="text-xs font-medium text-hydraulic-secondary mb-2">Working</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Speed (mm/s)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.working.speed}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            working: {...cyclePhases.working, speed: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Stroke (mm)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.working.stroke}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            working: {...cyclePhases.working, stroke: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Time (s)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.working.time}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            working: {...cyclePhases.working, time: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Holding */}
                  <div>
                    <h4 className="text-xs font-medium text-hydraulic-success mb-2">Holding</h4>
                    <div>
                      <Label className="text-xs">Time (s)</Label>
                      <Input
                        type="number"
                        value={cyclePhases.holding.time}
                        onChange={(e) => setCyclePhases({
                          ...cyclePhases,
                          holding: {time: parseInt(e.target.value)}
                        })}
                        className="h-8 text-xs bg-background border-border"
                      />
                    </div>
                  </div>

                  {/* Fast Up */}
                  <div>
                    <h4 className="text-xs font-medium text-hydraulic-warning mb-2">Fast Up</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Speed (mm/s)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.fastUp.speed}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            fastUp: {...cyclePhases.fastUp, speed: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Stroke (mm)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.fastUp.stroke}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            fastUp: {...cyclePhases.fastUp, stroke: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Time (s)</Label>
                        <Input
                          type="number"
                          value={cyclePhases.fastUp.time}
                          onChange={(e) => setCyclePhases({
                            ...cyclePhases,
                            fastUp: {...cyclePhases.fastUp, time: parseInt(e.target.value)}
                          })}
                          className="h-8 text-xs bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Run Simulation Button */}
          <Button
            onClick={runSimulation}
            className="w-full bg-gradient-hydraulic hover:opacity-90 text-white font-medium transition-smooth"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>

          {isSimulated && (
            <Badge variant="outline" className="w-full justify-center border-hydraulic-success text-hydraulic-success">
              Simulation Complete
            </Badge>
          )}
        </div>

        {/* Graphs Panel */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {graphs.map((graph, index) => (
              <GraphCard
                key={index}
                title={graph.title}
                dataKey={graph.dataKey}
                color={graph.color}
                unit={graph.unit}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}