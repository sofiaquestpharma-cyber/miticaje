-- Crear función para establecer configuración de sesión
CREATE OR REPLACE FUNCTION set_config(setting_name text, setting_value text, is_local boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
  RETURN setting_value;
END;
$$;

-- Dar permisos para usar la función
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO anon;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;
