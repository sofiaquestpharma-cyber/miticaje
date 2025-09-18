-- Crear tabla de centros de trabajo
CREATE TABLE work_centers (
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

-- Verificar si la columna work_center_id ya existe en employees antes de añadirla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'work_center_id'
    ) THEN
        ALTER TABLE employees ADD COLUMN work_center_id UUID REFERENCES work_centers(id);
    END IF;
END $$;

-- Verificar si la columna work_center_id ya existe en time_records antes de añadirla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_records' AND column_name = 'work_center_id'
    ) THEN
        ALTER TABLE time_records ADD COLUMN work_center_id UUID REFERENCES work_centers(id);
    END IF;
END $$;

-- Crear índices
CREATE INDEX idx_employees_work_center ON employees(work_center_id);
CREATE INDEX idx_time_records_work_center ON time_records(work_center_id);

-- Habilitar RLS para work_centers
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;

-- Crear políticas para centros de trabajo
CREATE POLICY "Allow public read access to work centers" ON work_centers
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access to work centers" ON work_centers
    FOR ALL USING (auth.role() = 'authenticated');

-- Insertar centro de trabajo por defecto
INSERT INTO work_centers (name, address, city, is_active) 
VALUES ('Sede Principal', 'Dirección Principal', 'Ciudad', true);

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
