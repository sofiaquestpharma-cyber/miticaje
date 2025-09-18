-- Crear tabla de empleados
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id_internal TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de registros de tiempo
CREATE TABLE time_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) NOT NULL,
    action_type TEXT CHECK (action_type IN ('entrada', 'salida', 'inicio_pausa', 'fin_pausa')) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    is_edited_by_admin BOOLEAN DEFAULT FALSE,
    admin_justification TEXT,
    admin_editor_id UUID,
    edit_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de configuración de la aplicación
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- Insertar configuración inicial
INSERT INTO app_settings (key, value, description) VALUES
('standard_workday_hours', '8', 'Horas estándar de jornada laboral'),
('company_name', 'Quest Pharma Contract Research SL', 'Nombre de la empresa');

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_time_records_employee_id ON time_records(employee_id);
CREATE INDEX idx_time_records_timestamp ON time_records(timestamp);
CREATE INDEX idx_employees_internal_id ON employees(employee_id_internal);
