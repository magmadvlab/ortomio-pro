-- Advanced Irrigation System Migration
-- Creates comprehensive irrigation management with zones, systems, logging, and analytics

-- Create irrigation_zones table
CREATE TABLE IF NOT EXISTS irrigation_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  area_sqm DECIMAL(10,2) NOT NULL,
  soil_type TEXT CHECK (soil_type IN ('clay', 'loam', 'sand', 'mixed')) DEFAULT 'loam',
  slope_percentage DECIMAL(5,2) DEFAULT 0,
  sun_exposure TEXT CHECK (sun_exposure IN ('full', 'partial', 'shade')) DEFAULT 'full',
  drainage_quality TEXT CHECK (drainage_quality IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
  water_retention TEXT CHECK (water_retention IN ('high', 'medium', 'low')) DEFAULT 'medium',
  ph_level DECIMAL(3,1),
  organic_matter_percentage DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create irrigation_systems table
CREATE TABLE IF NOT EXISTS irrigation_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES irrigation_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  system_type TEXT CHECK (system_type IN ('drip', 'sprinkler', 'micro', 'subsurface', 'manual')) NOT NULL,
  brand TEXT,
  model TEXT,
  installation_date DATE,
  
  -- Flow and pressure specifications
  flow_rate_lh DECIMAL(8,2) NOT NULL, -- liters per hour
  pressure_bar DECIMAL(5,2) NOT NULL,
  operating_pressure_min_bar DECIMAL(5,2),
  operating_pressure_max_bar DECIMAL(5,2),
  
  -- Pipe configuration
  pipe_diameter_mm INTEGER,
  pipe_material TEXT CHECK (pipe_material IN ('pvc', 'pe', 'rubber', 'metal', 'other')),
  pipe_length_m DECIMAL(8,2),
  
  -- Emitter configuration (for drip/micro systems)
  emitter_type TEXT, -- dripper, micro-sprinkler, nebulizer
  emitter_spacing_cm INTEGER,
  emitter_flow_rate_lh DECIMAL(6,3), -- individual emitter flow
  emitter_count INTEGER,
  
  -- Coverage configuration (for sprinkler systems)
  coverage_radius_m DECIMAL(6,2),
  coverage_angle_degrees INTEGER,
  overlap_percentage DECIMAL(5,2),
  
  -- Performance metrics
  efficiency_percentage DECIMAL(5,2) DEFAULT 85,
  uniformity_coefficient DECIMAL(5,2),
  
  -- Status and maintenance
  is_active BOOLEAN DEFAULT TRUE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER DEFAULT 90,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create irrigation_logs table
CREATE TABLE IF NOT EXISTS irrigation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES irrigation_zones(id) ON DELETE CASCADE,
  system_id UUID REFERENCES irrigation_systems(id) ON DELETE SET NULL,
  
  -- Timing information
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  planned_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  
  -- Volume information
  planned_volume_liters DECIMAL(10,2) NOT NULL,
  actual_volume_liters DECIMAL(10,2),
  flow_rate_measured_lh DECIMAL(8,2),
  
  -- Pressure monitoring
  pressure_start_bar DECIMAL(5,2),
  pressure_end_bar DECIMAL(5,2),
  pressure_avg_bar DECIMAL(5,2),
  pressure_variations TEXT, -- JSON array of pressure readings
  
  -- Environmental conditions
  weather_conditions TEXT,
  temperature_celsius DECIMAL(4,1),
  humidity_percentage DECIMAL(5,2),
  wind_speed_kmh DECIMAL(5,2),
  
  -- Soil conditions
  soil_moisture_before_percentage DECIMAL(5,2),
  soil_moisture_after_percentage DECIMAL(5,2),
  soil_temperature_celsius DECIMAL(4,1),
  
  -- Operational data
  irrigation_type TEXT CHECK (irrigation_type IN ('scheduled', 'manual', 'emergency', 'test')) DEFAULT 'manual',
  trigger_source TEXT, -- 'user', 'schedule', 'sensor', 'weather'
  operator_id UUID REFERENCES auth.users(id),
  operator_notes TEXT,
  
  -- Quality metrics
  distribution_uniformity DECIMAL(5,2),
  application_efficiency DECIMAL(5,2),
  
  -- Issues and alerts
  issues_detected TEXT[], -- array of issue codes
  alerts_triggered TEXT[], -- array of alert types
  
  -- Cost tracking
  water_cost_euros DECIMAL(8,2),
  energy_cost_euros DECIMAL(8,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create irrigation_schedules table
CREATE TABLE IF NOT EXISTS irrigation_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES irrigation_zones(id) ON DELETE CASCADE,
  system_id UUID REFERENCES irrigation_systems(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Schedule type and timing
  schedule_type TEXT CHECK (schedule_type IN ('daily', 'weekly', 'interval', 'conditional')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Daily/Weekly scheduling
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
  time_slots TIME[], -- array of start times
  duration_minutes INTEGER NOT NULL,
  
  -- Interval scheduling
  frequency_days INTEGER,
  last_execution_date DATE,
  next_execution_date DATE,
  
  -- Conditional triggers
  weather_conditions TEXT[], -- conditions that enable/disable
  soil_moisture_threshold_min DECIMAL(5,2),
  soil_moisture_threshold_max DECIMAL(5,2),
  temperature_threshold_min DECIMAL(4,1),
  temperature_threshold_max DECIMAL(4,1),
  
  -- Rain delay settings
  rain_delay_hours INTEGER DEFAULT 24,
  rain_threshold_mm DECIMAL(5,2) DEFAULT 5,
  
  -- Override settings
  allow_manual_override BOOLEAN DEFAULT TRUE,
  priority_level INTEGER DEFAULT 1, -- 1=low, 5=high
  
  -- Seasonal adjustments
  seasonal_adjustment_percentage DECIMAL(5,2) DEFAULT 100,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create water_requirements table
CREATE TABLE IF NOT EXISTS water_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES irrigation_zones(id) ON DELETE CASCADE,
  
  calculation_date DATE NOT NULL,
  
  -- Evapotranspiration data
  et0_mm DECIMAL(6,3) NOT NULL, -- reference evapotranspiration
  kc_coefficient DECIMAL(4,3) NOT NULL, -- crop coefficient
  etc_mm DECIMAL(6,3) NOT NULL, -- crop evapotranspiration (ET0 * Kc)
  
  -- Crop information
  crop_stage TEXT, -- germination, vegetative, flowering, fruiting, maturity
  crop_age_days INTEGER,
  leaf_area_index DECIMAL(4,2),
  
  -- Weather data
  effective_rainfall_mm DECIMAL(6,2) DEFAULT 0,
  temperature_avg_celsius DECIMAL(4,1),
  humidity_avg_percentage DECIMAL(5,2),
  wind_speed_avg_kmh DECIMAL(5,2),
  solar_radiation_mjm2 DECIMAL(6,2),
  
  -- Soil water balance
  soil_water_deficit_mm DECIMAL(6,2),
  field_capacity_mm DECIMAL(6,2),
  wilting_point_mm DECIMAL(6,2),
  available_water_mm DECIMAL(6,2),
  
  -- Irrigation requirements
  irrigation_need_mm DECIMAL(6,3) NOT NULL,
  recommended_volume_liters DECIMAL(10,2) NOT NULL,
  recommended_duration_minutes INTEGER,
  
  -- Calculation metadata
  calculation_method TEXT DEFAULT 'penman_monteith',
  weather_data_source TEXT,
  confidence_level DECIMAL(5,2) DEFAULT 85,
  
  -- AI predictions
  ai_adjustment_factor DECIMAL(4,3) DEFAULT 1.0,
  ai_confidence_score DECIMAL(5,2),
  ai_reasoning TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create irrigation_sensors table (for IoT integration)
CREATE TABLE IF NOT EXISTS irrigation_sensors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES irrigation_zones(id) ON DELETE CASCADE,
  system_id UUID REFERENCES irrigation_systems(id) ON DELETE SET NULL,
  
  sensor_type TEXT CHECK (sensor_type IN ('soil_moisture', 'pressure', 'flow', 'temperature', 'ph', 'ec')) NOT NULL,
  sensor_name TEXT NOT NULL,
  device_id TEXT UNIQUE,
  brand TEXT,
  model TEXT,
  
  -- Installation details
  installation_date DATE,
  depth_cm INTEGER, -- for soil sensors
  position_description TEXT,
  
  -- Calibration data
  calibration_date DATE,
  calibration_offset DECIMAL(8,4) DEFAULT 0,
  calibration_multiplier DECIMAL(8,4) DEFAULT 1,
  
  -- Operational settings
  reading_interval_minutes INTEGER DEFAULT 60,
  alert_threshold_min DECIMAL(8,2),
  alert_threshold_max DECIMAL(8,2),
  
  is_active BOOLEAN DEFAULT TRUE,
  battery_level_percentage DECIMAL(5,2),
  last_reading_time TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES irrigation_sensors(id) ON DELETE CASCADE,
  
  reading_time TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_value DECIMAL(12,4) NOT NULL,
  calibrated_value DECIMAL(12,4) NOT NULL,
  unit TEXT NOT NULL,
  
  -- Quality indicators
  signal_strength DECIMAL(5,2),
  battery_voltage DECIMAL(4,2),
  temperature_celsius DECIMAL(4,1), -- sensor temperature
  
  -- Data validation
  is_valid BOOLEAN DEFAULT TRUE,
  validation_flags TEXT[], -- array of validation issue codes
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_irrigation_zones_garden_id ON irrigation_zones(garden_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_zones_active ON irrigation_zones(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_irrigation_systems_zone_id ON irrigation_systems(zone_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_systems_type ON irrigation_systems(system_type);
CREATE INDEX IF NOT EXISTS idx_irrigation_systems_active ON irrigation_systems(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_irrigation_logs_zone_id ON irrigation_logs(zone_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_system_id ON irrigation_logs(system_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_start_time ON irrigation_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_date ON irrigation_logs(DATE(start_time));

CREATE INDEX IF NOT EXISTS idx_irrigation_schedules_zone_id ON irrigation_schedules(zone_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_schedules_active ON irrigation_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_irrigation_schedules_next_execution ON irrigation_schedules(next_execution_date) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_water_requirements_zone_id ON water_requirements(zone_id);
CREATE INDEX IF NOT EXISTS idx_water_requirements_date ON water_requirements(calculation_date);

CREATE INDEX IF NOT EXISTS idx_irrigation_sensors_zone_id ON irrigation_sensors(zone_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_sensors_type ON irrigation_sensors(sensor_type);
CREATE INDEX IF NOT EXISTS idx_irrigation_sensors_active ON irrigation_sensors(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_time ON sensor_readings(reading_time);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_date ON sensor_readings(DATE(reading_time));

-- Enable RLS
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for irrigation_zones
CREATE POLICY "Users can view their own irrigation zones" ON irrigation_zones
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own irrigation zones" ON irrigation_zones
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own irrigation zones" ON irrigation_zones
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own irrigation zones" ON irrigation_zones
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for irrigation_systems
CREATE POLICY "Users can view their own irrigation systems" ON irrigation_systems
  FOR SELECT USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own irrigation systems" ON irrigation_systems
  FOR INSERT WITH CHECK (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own irrigation systems" ON irrigation_systems
  FOR UPDATE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own irrigation systems" ON irrigation_systems
  FOR DELETE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for irrigation_logs
CREATE POLICY "Users can view their own irrigation logs" ON irrigation_logs
  FOR SELECT USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own irrigation logs" ON irrigation_logs
  FOR INSERT WITH CHECK (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own irrigation logs" ON irrigation_logs
  FOR UPDATE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for irrigation_schedules
CREATE POLICY "Users can view their own irrigation schedules" ON irrigation_schedules
  FOR SELECT USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own irrigation schedules" ON irrigation_schedules
  FOR INSERT WITH CHECK (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own irrigation schedules" ON irrigation_schedules
  FOR UPDATE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own irrigation schedules" ON irrigation_schedules
  FOR DELETE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for water_requirements
CREATE POLICY "Users can view their own water requirements" ON water_requirements
  FOR SELECT USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own water requirements" ON water_requirements
  FOR INSERT WITH CHECK (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for irrigation_sensors
CREATE POLICY "Users can view their own irrigation sensors" ON irrigation_sensors
  FOR SELECT USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own irrigation sensors" ON irrigation_sensors
  FOR INSERT WITH CHECK (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own irrigation sensors" ON irrigation_sensors
  FOR UPDATE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own irrigation sensors" ON irrigation_sensors
  FOR DELETE USING (
    zone_id IN (
      SELECT id FROM irrigation_zones WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for sensor_readings (inherit from sensor)
CREATE POLICY "Users can view readings from their own sensors" ON sensor_readings
  FOR SELECT USING (
    sensor_id IN (
      SELECT id FROM irrigation_sensors WHERE zone_id IN (
        SELECT id FROM irrigation_zones WHERE garden_id IN (
          SELECT id FROM gardens WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert readings to their own sensors" ON sensor_readings
  FOR INSERT WITH CHECK (
    sensor_id IN (
      SELECT id FROM irrigation_sensors WHERE zone_id IN (
        SELECT id FROM irrigation_zones WHERE garden_id IN (
          SELECT id FROM gardens WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_irrigation_zones_updated_at BEFORE UPDATE ON irrigation_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_systems_updated_at BEFORE UPDATE ON irrigation_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_schedules_updated_at BEFORE UPDATE ON irrigation_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_sensors_updated_at BEFORE UPDATE ON irrigation_sensors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create utility functions for calculations

-- Function to calculate irrigation duration based on flow rate and volume
CREATE OR REPLACE FUNCTION calculate_irrigation_duration(
  flow_rate_lh DECIMAL,
  target_volume_liters DECIMAL
) RETURNS INTEGER AS $$
BEGIN
  IF flow_rate_lh <= 0 THEN
    RETURN 0;
  END IF;
  
  RETURN CEIL((target_volume_liters / flow_rate_lh) * 60); -- return minutes
END;
$$ LANGUAGE plpgsql;

-- Function to calculate water requirement based on ET0 and Kc
CREATE OR REPLACE FUNCTION calculate_water_requirement(
  et0_mm DECIMAL,
  kc_coefficient DECIMAL,
  area_sqm DECIMAL,
  efficiency_percentage DECIMAL DEFAULT 85
) RETURNS DECIMAL AS $$
DECLARE
  etc_mm DECIMAL;
  gross_requirement_mm DECIMAL;
  volume_liters DECIMAL;
BEGIN
  -- Calculate crop evapotranspiration
  etc_mm := et0_mm * kc_coefficient;
  
  -- Adjust for system efficiency
  gross_requirement_mm := etc_mm / (efficiency_percentage / 100.0);
  
  -- Convert to volume (1mm over 1m² = 1 liter)
  volume_liters := gross_requirement_mm * area_sqm;
  
  RETURN volume_liters;
END;
$$ LANGUAGE plpgsql;

-- Function to get active schedules for execution
CREATE OR REPLACE FUNCTION get_schedules_due_for_execution()
RETURNS TABLE(
  schedule_id UUID,
  zone_id UUID,
  system_id UUID,
  duration_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.zone_id,
    s.system_id,
    s.duration_minutes
  FROM irrigation_schedules s
  WHERE s.is_active = TRUE
    AND s.next_execution_date <= CURRENT_DATE
    AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;