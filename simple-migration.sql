-- Migración simplificada para MiTicaje Quest Pharma
-- Ejecutar en SQL Editor de Supabase

-- 1. Tabla de centros de trabajo
CREATE TABLE work_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 2. Tabla de empleados
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 3. Tabla de registros de tiempo
CREATE TABLE time_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('entrada', 'salida', 'inicio_pausa', 'fin_pausa')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(8, 2),
    address TEXT,
    location_timestamp TIMESTAMP WITH TIME ZONE,
    location_error TEXT,
    is_edited_by_admin BOOLEAN DEFAULT false,
    admin_justification TEXT,
    admin_editor_id VARCHAR(255),
    edit_timestamp TIMESTAMP WITH TIME ZONE,
    work_center_id UUID REFERENCES work_centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de configuraciones
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de ubicaciones autorizadas
CREATE TABLE authorized_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices básicos
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_time_records_employee ON time_records(employee_id);
CREATE INDEX idx_time_records_timestamp ON time_records(timestamp);
CREATE INDEX idx_time_records_action_type ON time_records(action_type);

-- 7. Datos iniciales
INSERT INTO app_settings (key, value, description) VALUES
('company_name', 'Quest Pharma Laboratorio', 'Nombre de la empresa'),
('geolocation_enabled', 'true', 'Geolocalización habilitada'),
('standard_workday_hours', '8', 'Horas estándar de trabajo por día');

-- 8. Centro de trabajo inicial
INSERT INTO work_centers (name, address, city, latitude, longitude, is_active) VALUES
('Quest Pharma Laboratorio', 'Quest Pharma, Fuente Álamo de Murcia, Región de Murcia, España', 'Fuente Álamo de Murcia', 37.728287, -1.207111, true);

-- 9. Empleado inicial
INSERT INTO employees (employee_id, employee_id_internal, name, pin, department, position, is_active, work_center_id) 
SELECT '1', '1', 'María Isabel Crespo', '1234', 'Administración', 'Empleada', true, id 
FROM work_centers WHERE name = 'Quest Pharma Laboratorio';

-- Verificación
SELECT 'Tablas creadas exitosamente' as status;
