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
    
    // Unit conversions according to formulas
    const bore = cylinder.bore / 100; // cm to meters
    const rod = cylinder.rod / 1000; // mm to meters
    const deadLoad = cylinder.deadLoad * 1000; // ton to kg
    const holdLoad = cylinder.holdingLoad * 1000; // ton to kg
    
    // Calculate cylinder areas (m²)
    const A = Math.PI * Math.pow(bore / 2, 2); // Piston area
    const Ar = Math.PI * Math.pow(rod / 2, 2); // Rod area
    const Aret = A - Ar; // Return area
    
    // Calculate forces (N)
    const Fdead = deadLoad * 9.81;
    const Fhold = holdLoad * 9.81;
    
    // Calculate pressures (bar)
    const Pdead = Fdead / (A * 100000); // Fast Down pressure
    const Phold = Fhold / (A * 100000); // Working/Holding pressure
    const Pup = Fdead / (Aret * 100000); // Fast Up pressure

    const timeStep = 0.1;
    const totalPoints = Math.floor(totalCycleTime / timeStep);
    
    let currentTime = 0;
    let currentStroke = 0;
    let phase = 'fastDown';
    
    for (let i = 0; i <= totalPoints; i++) {
      let speed = 0;
      let pressure = 0;
      let flow = 0;
      
      // Determine current phase and calculate stroke
      if (currentTime <= cyclePhases.fastDown.time) {
        phase = 'fastDown';
        speed = cyclePhases.fastDown.speed;
        currentStroke = (currentTime / cyclePhases.fastDown.time) * cyclePhases.fastDown.stroke;
        pressure = Pdead;
      } else if (currentTime <= cyclePhases.fastDown.time + cyclePhases.working.time) {
        phase = 'working';
        speed = cyclePhases.working.speed;
        const workingTime = currentTime - cyclePhases.fastDown.time;
        currentStroke = cyclePhases.fastDown.stroke + (workingTime / cyclePhases.working.time) * cyclePhases.working.stroke;
        pressure = Phold;
      } else if (currentTime <= cyclePhases.fastDown.time + cyclePhases.working.time + cyclePhases.holding.time) {
        phase = 'holding';
        speed = 0;
        currentStroke = cyclePhases.fastDown.stroke + cyclePhases.working.stroke;
        pressure = Phold;
      } else {
        phase = 'fastUp';
        speed = -cyclePhases.fastUp.speed;
        const upTime = currentTime - cyclePhases.fastDown.time - cyclePhases.working.time - cyclePhases.holding.time;
        currentStroke = cyclePhases.fastDown.stroke + cyclePhases.working.stroke - 
                       (upTime / cyclePhases.fastUp.time) * cyclePhases.fastUp.stroke;
        pressure = Pup;
      }
      
      // Calculate flow (L/min) according to formula
      const v = Math.abs(speed) / 1000; // Convert mm/s to m/s
      const areaForFlow = phase === 'fastUp' ? Aret : A;
      flow = areaForFlow * v * 60 * 1000; // Convert to L/min
      
      // Calculate hydraulic power (kW)
      const hydraulicPower = (pressure + motorSystem.systemLosses) * flow / 600;
      
      // Calculate motor input power (kW)
      const motorPower = hydraulicPower / motorSystem.pumpEfficiency;
      
      // Ideal motor input power (kW)
      const idealMotorPower = pressure * flow / 600;
      
      // Calculate swashplate angle (degrees)
      const sinValue = Math.max(-1, Math.min(1, 
        (flow * 1000 * Math.sin(25 * Math.PI / 180)) / (25 * 0.95 * motorSystem.motorRpm)
      ));
      const swashplateAngle = Math.asin(sinValue) * 180 / Math.PI;
      
      data.push({
        time: currentTime,
        stroke: currentStroke,
        speed: Math.abs(speed),
        flow: flow,
        pressure: pressure + motorSystem.systemLosses,
        hydraulicPower: hydraulicPower,
        motorPower: motorPower,
        idealMotorPower: idealMotorPower,
        swashplateAngle: Math.abs(swashplateAngle),
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