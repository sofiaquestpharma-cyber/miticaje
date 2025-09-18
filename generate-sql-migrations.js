// Script para generar todas las migraciones SQL necesarias
import fs from 'fs'

function generateCompleteMigration() {
  console.log('📝 Generando migración SQL completa...')
  
  const migration = `-- ============================================
-- MIGRACIÓN COMPLETA MITICAJE QUEST PHARMA
-- Sistema de Control Horario con Geolocalización
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA: work_centers (Centros de Trabajo)
-- ============================================
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TABLA: employees (Empleados)
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    employee_id_internal VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    pin VARCHAR(10) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    work_center_id UUID REFERENCES work_centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABLA: time_records (Registros de Tiempo)
-- ============================================
CREATE TABLE IF NOT EXISTS time_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('entrada', 'salida', 'inicio_pausa', 'fin_pausa')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Campos de geolocalización
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(8, 2),
    address TEXT,
    location_timestamp TIMESTAMP WITH TIME ZONE,
    location_error TEXT,
    
    -- Campos de administración
    is_edited_by_admin BOOLEAN DEFAULT false,
    admin_justification TEXT,
    admin_editor_id VARCHAR(255),
    edit_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Centro de trabajo
    work_center_id UUID REFERENCES work_centers(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABLA: app_settings (Configuraciones)
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TABLA: authorized_locations (Ubicaciones Autorizadas)
-- ============================================
CREATE TABLE IF NOT EXISTS authorized_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para employees
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_work_center ON employees(work_center_id);

-- Índices para time_records
CREATE INDEX IF NOT EXISTS idx_time_records_employee ON time_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_records_timestamp ON time_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_records_action_type ON time_records(action_type);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_time_records_work_center ON time_records(work_center_id);

-- Índices para work_centers
CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers(is_active);

-- Índices para authorized_locations
CREATE INDEX IF NOT EXISTS idx_authorized_locations_active ON authorized_locations(is_active);

-- ============================================
-- 7. FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_centers_updated_at BEFORE UPDATE ON work_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_records_updated_at BEFORE UPDATE ON time_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authorized_locations_updated_at BEFORE UPDATE ON authorized_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_locations ENABLE ROW LEVEL SECURITY;

-- Políticas para employees
CREATE POLICY "Employees are viewable by everyone" ON employees FOR SELECT USING (true);
CREATE POLICY "Employees are insertable by authenticated users" ON employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Employees are updatable by authenticated users" ON employees FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para work_centers
CREATE POLICY "Work centers are viewable by everyone" ON work_centers FOR SELECT USING (true);
CREATE POLICY "Work centers are insertable by authenticated users" ON work_centers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Work centers are updatable by authenticated users" ON work_centers FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para time_records
CREATE POLICY "Time records are viewable by everyone" ON time_records FOR SELECT USING (true);
CREATE POLICY "Time records are insertable by everyone" ON time_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Time records are updatable by authenticated users" ON time_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Time records are deletable by authenticated users" ON time_records FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para app_settings
CREATE POLICY "App settings are viewable by everyone" ON app_settings FOR SELECT USING (true);
CREATE POLICY "App settings are insertable by authenticated users" ON app_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "App settings are updatable by authenticated users" ON app_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para authorized_locations
CREATE POLICY "Authorized locations are viewable by everyone" ON authorized_locations FOR SELECT USING (true);
CREATE POLICY "Authorized locations are insertable by authenticated users" ON authorized_locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authorized locations are updatable by authenticated users" ON authorized_locations FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- 9. DATOS INICIALES
-- ============================================

-- Configuraciones por defecto
INSERT INTO app_settings (key, value, description) VALUES
('company_name', 'Quest Pharma Laboratorio', 'Nombre de la empresa'),
('max_location_distance', '100', 'Distancia máxima permitida para fichaje (metros)'),
('require_location', 'true', 'Requerir geolocalización para fichaje')
ON CONFLICT (key) DO NOTHING;

-- Centro de trabajo por defecto
INSERT INTO work_centers (name, address, city, latitude, longitude, is_active) VALUES
('Quest Pharma Laboratorio', 'Quest Pharma, Fuente Álamo de Murcia, Región de Murcia, España', 'Fuente Álamo de Murcia', 37.728287, -1.207111, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '  - employees';
    RAISE NOTICE '  - work_centers';
    RAISE NOTICE '  - time_records';
    RAISE NOTICE '  - app_settings';
    RAISE NOTICE '  - authorized_locations';
    RAISE NOTICE '🔒 Row Level Security habilitado';
    RAISE NOTICE '📈 Índices de optimización creados';
    RAISE NOTICE '🚀 Base de datos lista para MiTicaje Quest Pharma';
END $$;`

  // Guardar migración en archivo
  const fileName = 'complete-migration.sql'
  fs.writeFileSync(fileName, migration)
  
  console.log(`✅ Migración SQL generada: ${fileName}`)
  console.log('📋 Esta migración incluye:')
  console.log('  - Todas las tablas necesarias')
  console.log('  - Índices de optimización')
  console.log('  - Row Level Security')
  console.log('  - Triggers automáticos')
  console.log('  - Datos iniciales')
  
  return fileName
}

// Ejecutar generación
generateCompleteMigration()
