
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Journal from './components/Journal';
import Advice from './components/Advice';
import HarvestLog from './components/HarvestLog';
import SmartHub from './components/SmartHub';
import { Tab, GardenTask, Garden, GardenProfile, SmartDevice } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [activeGardenId, setActiveGardenId] = useState<string>('');
  
  // IoT State
  const [smartDevices, setSmartDevices] = useState<SmartDevice[]>([]);

  // Initialization: Load data and handle migration
  useEffect(() => {
    // 1. Load Gardens
    const savedGardens = localStorage.getItem('ortoGardens');
    let loadedGardens: Garden[] = [];
    
    if (savedGardens) {
        try {
            loadedGardens = JSON.parse(savedGardens);
        } catch(e) { console.error("Error parsing gardens"); }
    } else {
        // Migration: Check for old single profile
        const oldProfile = localStorage.getItem('ortoProfile');
        if (oldProfile) {
            try {
                const parsed = JSON.parse(oldProfile) as GardenProfile;
                loadedGardens = [{
                    id: crypto.randomUUID(),
                    name: 'Il Mio Orto',
                    createdAt: new Date().toISOString(),
                    sizeSqMeters: parsed.sizeSqMeters || 0,
                    soilPh: parsed.soilPh,
                    soilType: parsed.soilType
                }];
            } catch(e) {}
        }
    }

    // Ensure at least one garden exists
    if (loadedGardens.length === 0) {
        loadedGardens = [{
            id: crypto.randomUUID(),
            name: 'Il Mio Orto',
            createdAt: new Date().toISOString(),
            sizeSqMeters: 0
        }];
    }
    
    setGardens(loadedGardens);
    // Set active garden (prefer last active or first)
    const lastActive = localStorage.getItem('ortoActiveGardenId');
    if (lastActive && loadedGardens.find(g => g.id === lastActive)) {
        setActiveGardenId(lastActive);
    } else {
        setActiveGardenId(loadedGardens[0].id);
    }

    // 2. Load Tasks and Migrate if needed
    const savedTasks = localStorage.getItem('ortoTasks');
    if (savedTasks) {
      try {
        let parsedTasks = JSON.parse(savedTasks) as GardenTask[];
        // Migration: Assign orphan tasks to the first garden
        const defaultGardenId = loadedGardens[0].id;
        let migrationNeeded = false;
        
        parsedTasks = parsedTasks.map(t => {
            if (!t.gardenId) {
                migrationNeeded = true;
                return { ...t, gardenId: defaultGardenId };
            }
            return t;
        });

        setTasks(parsedTasks);
        if (migrationNeeded) {
            localStorage.setItem('ortoTasks', JSON.stringify(parsedTasks));
        }
      } catch (e) {
        console.error("Failed to parse tasks");
      }
    }

    // 3. Initialize/Load Smart Devices
    const savedDevices = localStorage.getItem('ortoDevices');
    if (savedDevices) {
        setSmartDevices(JSON.parse(savedDevices));
    } else {
        // Create Default Mock Devices for existing gardens
        const mocks: SmartDevice[] = loadedGardens.map(g => ({
            id: crypto.randomUUID(),
            gardenId: g.id,
            name: `Zona 1 - ${g.name}`,
            type: 'Hub',
            moisture: 45, // Initial %
            isValveOpen: false,
            flowRateLpm: 6.0, // 6 Liters per minute standard
            sessionLiters: 0,
            targetLiters: 5, // Default cutoff
            autoThreshold: 30, // Default auto start
            autoMode: false,
            lastUpdate: new Date().toISOString()
        }));
        setSmartDevices(mocks);
    }
  }, []);

  // Persistence
  useEffect(() => {
    if (gardens.length > 0) {
        localStorage.setItem('ortoGardens', JSON.stringify(gardens));
    }
  }, [gardens]);

  useEffect(() => {
    localStorage.setItem('ortoTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
      if (activeGardenId) {
          localStorage.setItem('ortoActiveGardenId', activeGardenId);
      }
  }, [activeGardenId]);

  useEffect(() => {
      localStorage.setItem('ortoDevices', JSON.stringify(smartDevices));
  }, [smartDevices]);


  // -------------------------------------------------------------------------
  // IOT SIMULATION ENGINE
  // This effect simulates real-world physics: Water Flow, Soil Wetting/Drying
  // -------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
        setSmartDevices(currentDevices => currentDevices.map(device => {
            let newMoisture = device.moisture;
            let newSessionLiters = device.sessionLiters;
            let isValveOpen = device.isValveOpen;
            let changed = false;

            if (isValveOpen) {
                // VALVE IS OPEN:
                // 1. Increase Liters (Flow Rate / 60 seconds)
                const litersPerSecond = device.flowRateLpm / 60;
                newSessionLiters += litersPerSecond;
                
                // 2. Increase Moisture (Logarithmic wetting curve simulation)
                // Soil wets fast when dry, slower when saturated
                const wettingRate = (100 - newMoisture) * 0.05; 
                newMoisture += wettingRate;

                changed = true;

                // 3. AUTO-STOP LOGIC: Check Volume Target
                if (device.targetLiters > 0 && newSessionLiters >= device.targetLiters) {
                    isValveOpen = false; // Close valve
                    // In a real app, we would send a notification here
                }
            } else {
                // VALVE IS CLOSED:
                // 1. Decrease Moisture (Evaporation/Drainage simulation)
                // Dries faster when wet
                const dryingRate = 0.02 + (newMoisture * 0.001);
                newMoisture -= dryingRate;
                
                // 2. AUTO-START LOGIC: Check Moisture Threshold
                if (device.autoMode && device.autoThreshold > 0 && newMoisture < device.autoThreshold) {
                    isValveOpen = true; // Open valve
                    newSessionLiters = 0; // Reset counter for new session
                }
                
                if (Math.abs(newMoisture - device.moisture) > 0.01) changed = true;
            }

            // Clamp values
            newMoisture = Math.max(0, Math.min(100, newMoisture));

            if (changed || isValveOpen !== device.isValveOpen) {
                return {
                    ...device,
                    moisture: newMoisture,
                    sessionLiters: newSessionLiters,
                    isValveOpen: isValveOpen,
                    lastUpdate: new Date().toISOString()
                };
            }
            return device;
        }));
    }, 1000); // Run simulation every second

    return () => clearInterval(interval);
  }, []);
  // -------------------------------------------------------------------------


  // Actions
  const handleAddGarden = (newGarden: Garden) => {
      setGardens(prev => [...prev, newGarden]);
      setActiveGardenId(newGarden.id);
      // Create a default sensor for new garden
      const newDevice: SmartDevice = {
            id: crypto.randomUUID(),
            gardenId: newGarden.id,
            name: `Zona 1 - ${newGarden.name}`,
            type: 'Hub',
            moisture: 50,
            isValveOpen: false,
            flowRateLpm: 6.0,
            sessionLiters: 0,
            targetLiters: 10,
            autoThreshold: 0,
            autoMode: false,
            lastUpdate: new Date().toISOString()
      };
      setSmartDevices(prev => [...prev, newDevice]);
  };

  const handleUpdateGarden = (updatedGarden: Garden) => {
      setGardens(prev => prev.map(g => g.id === updatedGarden.id ? updatedGarden : g));
  };

  const handleDeleteGarden = (id: string) => {
      if (gardens.length <= 1) {
          alert("Non puoi eliminare l'unico orto rimasto.");
          return;
      }
      if (confirm("Sei sicuro?")) {
          setGardens(prev => prev.filter(g => g.id !== id));
          if (activeGardenId === id) {
              setActiveGardenId(gardens.find(g => g.id !== id)?.id || '');
          }
      }
  };

  const addTask = (taskData: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => {
    if (!activeGardenId) return;
    const newTask: GardenTask = {
      ...taskData,
      id: crypto.randomUUID(),
      gardenId: activeGardenId,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTask = (updatedTask: GardenTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }

  const deleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Smart Device Actions
  const toggleValve = (id: string, isOpen: boolean) => {
      setSmartDevices(prev => prev.map(d => {
          if (d.id === id) {
              return { 
                  ...d, 
                  isValveOpen: isOpen, 
                  sessionLiters: isOpen ? d.sessionLiters : d.sessionLiters // Keep session liters if opening, or hold if closing
                  // Ideally, reset sessionLiters to 0 only when starting a NEW distinct session after a delay, 
                  // but for simplicity, we reset on Auto-Start, and accumulate on Manual Toggle until explicit reset or auto-cycle.
                  // For this logic: Manual open continues session. Auto start resets.
              };
          }
          return d;
      }));
  };

  const updateDeviceSettings = (id: string, settings: Partial<SmartDevice>) => {
      setSmartDevices(prev => prev.map(d => d.id === id ? { ...d, ...settings } : d));
  };


  // Helper
  const currentGarden = gardens.find(g => g.id === activeGardenId);
  const gardenTasks = tasks.filter(t => t.gardenId === activeGardenId);

  const renderContent = () => {
    if (!currentGarden) return <div className="p-10 text-center">Caricamento...</div>;

    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard 
            tasks={gardenTasks} 
            onNavigateToJournal={() => setActiveTab(Tab.JOURNAL)} 
            gardens={gardens}
            activeGardenId={activeGardenId}
            onSelectGarden={setActiveGardenId}
            onAddGarden={handleAddGarden}
            onUpdateGarden={handleUpdateGarden}
            onDeleteGarden={handleDeleteGarden}
            onUpdateTask={updateTask}
        />;
      case Tab.PLANNER:
        return (
          <Planner 
            garden={currentGarden}
            tasks={gardenTasks}
            onUpdateTask={updateTask}
            onAddToJournal={(plantName, notes, variety, method, date, taskType, additionalData) => {
              const month = new Date(date || new Date().toISOString()).getMonth() + 1;
              const season = (month >= 4 && month <= 9) ? 'Summer' : 'Winter';

              addTask({
                plantName,
                variety,
                plantingMethod: method,
                taskType: taskType || (method === 'Seed' ? 'Sowing' : method === 'Seedling' ? 'Transplant' : 'Sowing'),
                date: date || new Date().toISOString().split('T')[0],
                notes,
                season,
                moonPhase: additionalData?.moonPhase,
                initialQuantity: additionalData?.initialQuantity,
                currentQuantity: additionalData?.currentQuantity,
                locationType: additionalData?.locationType,
                harvestReadyAnalysis: additionalData?.harvestReadyAnalysis,
              });
              setActiveTab(Tab.JOURNAL);
            }} 
          />
        );
      case Tab.ADVICE:
          return (
              <Advice 
                onAddToJournal={(title, notes, date) => {
                    const month = new Date(date).getMonth() + 1;
                    const season = (month >= 4 && month <= 9) ? 'Summer' : 'Winter';
                    addTask({
                        plantName: 'Trattamento',
                        taskType: 'Treatment',
                        date,
                        notes: `${title} - ${notes}`,
                        nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        season
                    });
                    setActiveTab(Tab.JOURNAL);
                }}
              />
          )
      case Tab.JOURNAL:
        return <Journal 
            tasks={gardenTasks} 
            garden={currentGarden}
            onToggleTask={toggleTask} 
            onAddTask={(t) => addTask(t)} // wrapper to handle gardenId in App
            onDeleteTask={deleteTask} 
            onUpdateTask={updateTask} 
        />;
      case Tab.HARVEST:
          return <HarvestLog 
            tasks={gardenTasks}
            onUpdateTask={updateTask}
            onAddHarvest={(plantName, data, season) => {
                const task: GardenTask = {
                    id: crypto.randomUUID(),
                    gardenId: activeGardenId,
                    plantName,
                    taskType: 'Harvest',
                    date: data.date,
                    completed: true,
                    season,
                    finalHarvest: data,
                    notes: `Manually added harvest: ${data.quantity}${data.unit}`
                };
                setTasks(prev => [...prev, task]);
            }}
          />
      case Tab.SMART:
          return <SmartHub 
            devices={smartDevices}
            garden={currentGarden}
            onToggleValve={toggleValve}
            onUpdateDeviceSettings={updateDeviceSettings}
          />
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-green-50/30 text-gray-800 font-sans">
      <main className="h-full">
        {renderContent()}
      </main>
      <Navigation currentTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
