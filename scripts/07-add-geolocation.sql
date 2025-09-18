-- Añadir columnas de geolocalización a la tabla time_records
ALTER TABLE time_records 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS accuracy DECIMAL(8, 2),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_error TEXT;

-- Crear índice para consultas geográficas (solo si no existe)
CREATE INDEX IF NOT EXISTS idx_time_records_location ON time_records(latitude, longitude);

-- Añadir configuración básica para geolocalización (solo si no existe)
INSERT INTO app_settings (key, value, description) 
SELECT 'geolocation_enabled', 'true', 'Habilitar captura automática de geolocalización'
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key = 'geolocation_enabled');

-- Crear tabla de ubicaciones autorizadas (opcional para admin)
CREATE TABLE IF NOT EXISTS authorized_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para authorized_locations
ALTER TABLE authorized_locations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow public read access to authorized locations" ON authorized_locations;
DROP POLICY IF EXISTS "Allow authenticated users full access to authorized locations" ON authorized_locations;

-- Crear políticas para ubicaciones autorizadas
CREATE POLICY "Allow public read access to authorized locations" ON authorized_locations
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access to authorized locations" ON authorized_locations
    FOR ALL USING (auth.role() = 'authenticated');
