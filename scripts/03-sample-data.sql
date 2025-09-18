-- Insertar empleados de ejemplo
INSERT INTO employees (employee_id_internal, name, is_active) VALUES
('EMP001', 'Ana García López', true),
('EMP002', 'Carlos Martín Ruiz', true),
('EMP003', 'María José Fernández', true),
('EMP004', 'David Rodríguez Sánchez', true),
('ADMIN', 'Administrador Sistema', true);

-- Insertar algunos registros de tiempo de ejemplo
INSERT INTO time_records (employee_id, action_type, timestamp) 
SELECT 
    e.id,
    'entrada',
    CURRENT_DATE + INTERVAL '9 hours'
FROM employees e 
WHERE e.employee_id_internal = 'EMP001';

INSERT INTO time_records (employee_id, action_type, timestamp) 
SELECT 
    e.id,
    'inicio_pausa',
    CURRENT_DATE + INTERVAL '13 hours'
FROM employees e 
WHERE e.employee_id_internal = 'EMP001';

INSERT INTO time_records (employee_id, action_type, timestamp) 
SELECT 
    e.id,
    'fin_pausa',
    CURRENT_DATE + INTERVAL '14 hours'
FROM employees e 
WHERE e.employee_id_internal = 'EMP001';
