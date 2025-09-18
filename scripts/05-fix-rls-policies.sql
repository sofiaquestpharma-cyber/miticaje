-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Employees can view their own data" ON employees;
DROP POLICY IF EXISTS "Employees can view their own time records" ON time_records;
DROP POLICY IF EXISTS "Employees can insert their own time records" ON time_records;
DROP POLICY IF EXISTS "Admins have full access to employees" ON employees;
DROP POLICY IF EXISTS "Admins have full access to time records" ON time_records;
DROP POLICY IF EXISTS "Admins have full access to settings" ON app_settings;
DROP POLICY IF EXISTS "Public can read app settings" ON app_settings;

-- Crear políticas más simples y funcionales
-- Políticas para empleados
CREATE POLICY "Allow public read access to employees" ON employees
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to read time records" ON time_records
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert time records" ON time_records
    FOR INSERT WITH CHECK (true);

-- Políticas para administradores (usuarios autenticados)
CREATE POLICY "Allow authenticated users full access to employees" ON employees
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to time records" ON time_records
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to settings" ON app_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Permitir acceso público a configuración (solo lectura)
CREATE POLICY "Allow public read access to settings" ON app_settings
    FOR SELECT USING (true);
