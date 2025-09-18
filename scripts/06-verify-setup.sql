-- Verificar que las tablas existen
SELECT 'employees' as table_name, count(*) as records FROM employees
UNION ALL
SELECT 'time_records' as table_name, count(*) as records FROM time_records
UNION ALL
SELECT 'app_settings' as table_name, count(*) as records FROM app_settings;

-- Verificar que las políticas RLS están activas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('employees', 'time_records', 'app_settings');

-- Verificar que la función set_config existe
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'set_config';

-- Mostrar empleados de ejemplo
SELECT employee_id_internal, name, is_active 
FROM employees 
ORDER BY employee_id_internal;
