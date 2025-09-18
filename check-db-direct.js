// Script para conectar directamente a PostgreSQL usando la URL de conexión
import pg from 'pg'
const { Client } = pg

// URL de conexión directa desde tu .env
const connectionString = "postgres://postgres.hifsiphoojqynrbwoacz:9Y3UfA6vn32axDYB@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"

async function checkDatabase() {
  console.log('🔍 Conectando directamente a PostgreSQL...')
  console.log('🆔 ID del proyecto: hifsiphoojqynrbwoacz')
  console.log('🌐 Host: db.hifsiphoojqynrbwoacz.supabase.co')
  console.log('')

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Conexión exitosa a la base de datos!')

    // Obtener versión de PostgreSQL
    console.log('\n📊 Información de la base de datos:')
    const versionResult = await client.query('SELECT version()')
    console.log('✅ Versión:', versionResult.rows[0].version)

    // Obtener nombre de la base de datos actual
    const dbResult = await client.query('SELECT current_database(), current_user')
    console.log('✅ Base de datos:', dbResult.rows[0].current_database)
    console.log('✅ Usuario:', dbResult.rows[0].current_user)

    // Obtener lista de tablas en el esquema public
    console.log('\n📋 Tablas en el esquema public:')
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`)
      })
    } else {
      console.log('  No se encontraron tablas en el esquema public')
    }

    // Intentar obtener empleados si existe la tabla
    try {
      console.log('\n👥 Empleados en el sistema:')
      const employeesResult = await client.query(`
        SELECT employee_id, name, email, department, active 
        FROM employees 
        LIMIT 5
      `)
      
      console.log(`✅ Total de empleados (muestra): ${employeesResult.rows.length}`)
      employeesResult.rows.forEach(emp => {
        console.log(`  - ${emp.employee_id}: ${emp.name} (${emp.department || 'Sin departamento'}) - ${emp.active ? 'Activo' : 'Inactivo'}`)
      })
    } catch (empError) {
      console.log('❌ Tabla employees no encontrada o sin acceso')
    }

    // Intentar obtener configuración si existe la tabla
    try {
      console.log('\n⚙️ Configuración de la aplicación:')
      const settingsResult = await client.query('SELECT key, value FROM app_settings LIMIT 10')
      
      if (settingsResult.rows.length > 0) {
        settingsResult.rows.forEach(setting => {
          console.log(`  - ${setting.key}: ${setting.value}`)
        })
      } else {
        console.log('  No hay configuraciones definidas')
      }
    } catch (settingsError) {
      console.log('❌ Tabla app_settings no encontrada')
    }

    console.log('\n✅ Información obtenida exitosamente!')
    console.log('\n💡 Para identificar la cuenta propietaria del proyecto:')
    console.log('   🌐 Ve a: https://supabase.com/dashboard/project/hifsiphoojqynrbwoacz')
    console.log('   📧 O revisa tus emails buscando "Supabase" + "hifsiphoojqynrbwoacz"')
    console.log('   🔑 El proyecto está funcionando correctamente con tus credenciales')

  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    console.log('\n🔧 Posibles soluciones:')
    console.log('   1. Verificar que las credenciales en .env sean correctas')
    console.log('   2. Comprobar la conexión a internet')
    console.log('   3. El proyecto podría estar pausado o inactivo')
  } finally {
    await client.end()
  }
}

// Ejecutar el script
checkDatabase()
