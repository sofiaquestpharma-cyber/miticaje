-- Crear tabla de centros de trabajo
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Añadir columna work_center_id a empleados
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES work_centers(id);

-- Añadir columna work_center_id a time_records
ALTER TABLE time_records 
ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES work_centers(id);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_employees_work_center ON employees(work_center_id);
CREATE INDEX IF NOT EXISTS idx_time_records_work_center ON time_records(work_center_id);

-- Habilitar RLS para work_centers
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;

-- Crear políticas para centros de trabajo
CREATE POLICY IF NOT EXISTS "Allow public read access to work centers" ON work_centers
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to work centers" ON work_centers
    FOR ALL USING (auth.role() = 'authenticated');

-- Insertar centro de trabajo por defecto
INSERT INTO work_centers (name, address, city, is_active) 
SELECT 'Sede Principal', 'Dirección Principal', 'Ciudad', true
WHERE NOT EXISTS (SELECT 1 FROM work_centers WHERE name = 'Sede Principal');

-- Asignar empleados existentes al centro principal (si no tienen uno asignado)
UPDATE employees 
SET work_center_id = (SELECT id FROM work_centers WHERE name = 'Sede Principal' LIMIT 1)
WHERE work_center_id IS NULL;

-- Asignar registros existentes al centro principal (si no tienen uno asignado)
UPDATE time_records 
SET work_center_id = (
    SELECT e.work_center_id 
    FROM employees e 
    WHERE e.id = time_records.employee_id
)
WHERE work_center_id IS NULL;
