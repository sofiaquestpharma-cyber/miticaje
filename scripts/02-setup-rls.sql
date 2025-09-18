-- Habilitar Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para empleados (solo pueden ver sus propios datos)
CREATE POLICY "Employees can view their own data" ON employees
    FOR SELECT USING (true); -- Los empleados pueden ver todos los empleados para el dropdown

CREATE POLICY "Employees can view their own time records" ON time_records
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees WHERE employee_id_internal = current_setting('app.current_employee_id', true)
        )
    );

CREATE POLICY "Employees can insert their own time records" ON time_records
    FOR INSERT WITH CHECK (
        employee_id IN (
            SELECT id FROM employees WHERE employee_id_internal = current_setting('app.current_employee_id', true)
        )
    );

-- Políticas para administradores (acceso completo)
CREATE POLICY "Admins have full access to employees" ON employees
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'email' IS NOT NULL
    );

CREATE POLICY "Admins have full access to time records" ON time_records
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'email' IS NOT NULL
    );

CREATE POLICY "Admins have full access to settings" ON app_settings
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'email' IS NOT NULL
    );

-- Política para acceso público a configuración (solo lectura)
CREATE POLICY "Public can read app settings" ON app_settings
    FOR SELECT USING (true);
