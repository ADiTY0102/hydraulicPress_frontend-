import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MotorSystemParams {
  motorRpm: number;
  pumpEfficiency: number;
  systemLosses: number;
}

interface CylinderParams {
  bore: number;
  rod: number;
  deadLoad: number;
  holdingLoad: number;
}

interface CyclePhaseParams {
  speed: number;
  stroke: number;
  time: number;
}

interface CyclePhases {
  fastDown: CyclePhaseParams;
  working: CyclePhaseParams;
  holding: { time: number };
  fastUp: CyclePhaseParams;
}

interface SimulationDataPoint {
  time: number;
  stroke: number;
  speed: number;
  flow: number;
  pressure: number;
  hydraulicPower: number;
  motorPower: number;
  idealMotorPower: number;
  swashplateAngle: number;
}

interface SimulationContextType {
  motorSystem: MotorSystemParams;
  cylinder: CylinderParams;
  cyclePhases: CyclePhases;
  simulationData: SimulationDataPoint[];
  isSimulated: boolean;
  setMotorSystem: (params: MotorSystemParams) => void;
  setCylinder: (params: CylinderParams) => void;
  setCyclePhases: (phases: CyclePhases) => void;
  runSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [motorSystem, setMotorSystem] = useState<MotorSystemParams>({
    motorRpm: 1800,
    pumpEfficiency: 0.9,
    systemLosses: 10,
  });

  const [cylinder, setCylinder] = useState<CylinderParams>({
    bore: 25,
    rod: 60,
    deadLoad: 2,
    holdingLoad: 8,
  });

  const [cyclePhases, setCyclePhases] = useState<CyclePhases>({
    fastDown: { speed: 200, stroke: 300, time: 2 },
    working: { speed: 3, stroke: 100, time: 4 },
    holding: { time: 1 },
    fastUp: { speed: 200, stroke: 400, time: 2 },
  });

  const [simulationData, setSimulationData] = useState<SimulationDataPoint[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);

  const calculateSimulation = (): SimulationDataPoint[] => {
    const data: SimulationDataPoint[] = [];
    const totalCycleTime = cyclePhases.fastDown.time + cyclePhases.working.time + 
                          cyclePhases.holding.time + cyclePhases.fastUp.time;
    
    // Calculate cylinder area in cm²
    const pistonArea = Math.PI * Math.pow(cylinder.bore / 2, 2);
    const rodArea = Math.PI * Math.pow(cylinder.rod / 20, 2); // Convert mm to cm
    const annularArea = pistonArea - rodArea;

    const timeStep = 0.1;
    const totalPoints = Math.floor(totalCycleTime / timeStep);
    
    let currentTime = 0;
    let currentStroke = 0;
    let phase = 'fastDown';
    
    for (let i = 0; i <= totalPoints; i++) {
      let speed = 0;
      let pressure = 0;
      let flow = 0;
      
      // Determine current phase
      if (currentTime <= cyclePhases.fastDown.time) {
        phase = 'fastDown';
        speed = cyclePhases.fastDown.speed;
        currentStroke = (currentTime / cyclePhases.fastDown.time) * cyclePhases.fastDown.stroke;
        pressure = (cylinder.deadLoad * 1000 * 9.81) / (pistonArea / 10000) / 100000; // Convert to bar
      } else if (currentTime <= cyclePhases.fastDown.time + cyclePhases.working.time) {
        phase = 'working';
        speed = cyclePhases.working.speed;
        const workingTime = currentTime - cyclePhases.fastDown.time;
        currentStroke = cyclePhases.fastDown.stroke + (workingTime / cyclePhases.working.time) * cyclePhases.working.stroke;
        pressure = (cylinder.holdingLoad * 1000 * 9.81) / (pistonArea / 10000) / 100000; // Convert to bar
      } else if (currentTime <= cyclePhases.fastDown.time + cyclePhases.working.time + cyclePhases.holding.time) {
        phase = 'holding';
        speed = 0;
        currentStroke = cyclePhases.fastDown.stroke + cyclePhases.working.stroke;
        pressure = (cylinder.holdingLoad * 1000 * 9.81) / (pistonArea / 10000) / 100000;
      } else {
        phase = 'fastUp';
        speed = -cyclePhases.fastUp.speed;
        const upTime = currentTime - cyclePhases.fastDown.time - cyclePhases.working.time - cyclePhases.holding.time;
        currentStroke = cyclePhases.fastDown.stroke + cyclePhases.working.stroke - 
                       (upTime / cyclePhases.fastUp.time) * cyclePhases.fastUp.stroke;
        pressure = (cylinder.deadLoad * 1000 * 9.81) / (annularArea / 10000) / 100000;
      }
      
      // Calculate flow (L/min)
      const areaForFlow = speed >= 0 ? pistonArea : annularArea;
      flow = Math.abs(speed * areaForFlow / 10000) * 60 / 1000; // Convert to L/min
      
      // Calculate hydraulic power (kW)
      const hydraulicPower = (pressure * 100000 * flow / 60 / 1000) / 1000; // Convert to kW
      
      // Calculate motor power considering efficiency
      const motorPower = hydraulicPower / motorSystem.pumpEfficiency + 
                        (motorSystem.systemLosses * flow / 60) / 1000;
      
      // Ideal motor power (without losses)
      const idealMotorPower = hydraulicPower / 0.95; // Assuming 95% ideal efficiency
      
      // Calculate swashplate angle (degrees) based on flow demand
      const maxFlow = (motorSystem.motorRpm * 0.05) / 60 * 1000; // Assumed displacement
      const swashplateAngle = Math.min(90, (flow / maxFlow) * 90);
      
      data.push({
        time: currentTime,
        stroke: currentStroke,
        speed: Math.abs(speed),
        flow: flow,
        pressure: pressure + motorSystem.systemLosses,
        hydraulicPower: hydraulicPower,
        motorPower: motorPower,
        idealMotorPower: idealMotorPower,
        swashplateAngle: swashplateAngle,
      });
      
      currentTime += timeStep;
    }
    
    return data;
  };

  const runSimulation = () => {
    const newData = calculateSimulation();
    setSimulationData(newData);
    setIsSimulated(true);
  };

  return (
    <SimulationContext.Provider value={{
      motorSystem,
      cylinder,
      cyclePhases,
      simulationData,
      isSimulated,
      setMotorSystem,
      setCylinder,
      setCyclePhases,
      runSimulation,
    }}>
      {children}
    </SimulationContext.Provider>
  );
};