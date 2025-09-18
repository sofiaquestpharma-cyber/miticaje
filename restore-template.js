// Script template para restaurar backup en nueva cuenta de Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// CONFIGURACIÓN DE LA NUEVA CUENTA SUPABASE
// ⚠️ IMPORTANTE: Actualiza estos valores con tu nuevo proyecto
const NEW_SUPABASE_URL = 'https://TU-NUEVO-PROYECTO.supabase.co'
const NEW_SUPABASE_ANON_KEY = 'TU-NUEVA-ANON-KEY-AQUI'

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY)

async function restoreBackup(backupFileName) {
  console.log('🔄 Iniciando restauración de backup...')
  
  try {
    // Leer archivo de backup
    if (!fs.existsSync(backupFileName)) {
      throw new Error(`Archivo de backup no encontrado: ${backupFileName}`)
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupFileName, 'utf8'))
    console.log(`📄 Cargando backup desde: ${backupFileName}`)
    console.log(`📅 Fecha del backup: ${backupData.timestamp}`)
    
    // 1. Restaurar centros de trabajo primero (dependencia)
    console.log('\n🏢 Restaurando centros de trabajo...')
    const workCenters = backupData.tables.work_centers || []
    
    for (const center of workCenters) {
      // Remover campos que se generan automáticamente
      const { id, created_at, updated_at, ...centerData } = center
      
      const { data, error } = await supabase
        .from('work_centers')
        .insert(centerData)
        .select()
      
      if (error) {
        console.error(`❌ Error al restaurar centro ${center.name}:`, error.message)
      } else {
        console.log(`✅ Centro restaurado: ${center.name}`)
      }
    }
    
    // 2. Restaurar empleados
    console.log('\n👥 Restaurando empleados...')
    const employees = backupData.tables.employees || []
    
    for (const employee of employees) {
      // Remover campos que se generan automáticamente
      const { id, created_at, updated_at, ...employeeData } = employee
      
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
      
      if (error) {
        console.error(`❌ Error al restaurar empleado ${employee.name}:`, error.message)
      } else {
        console.log(`✅ Empleado restaurado: ${employee.name}`)
      }
    }
    
    // 3. Restaurar configuraciones
    console.log('\n⚙️ Restaurando configuraciones...')
    const settings = backupData.tables.app_settings || []
    
    for (const setting of settings) {
      const { created_at, updated_at, ...settingData } = setting
      
      const { data, error } = await supabase
        .from('app_settings')
        .insert(settingData)
        .select()
      
      if (error) {
        console.error(`❌ Error al restaurar configuración ${setting.key}:`, error.message)
      } else {
        console.log(`✅ Configuración restaurada: ${setting.key}`)
      }
    }
    
    // 4. Restaurar ubicaciones autorizadas
    console.log('\n📍 Restaurando ubicaciones autorizadas...')
    const locations = backupData.tables.authorized_locations || []
    
    for (const location of locations) {
      const { id, created_at, updated_at, ...locationData } = location
      
      const { data, error } = await supabase
        .from('authorized_locations')
        .insert(locationData)
        .select()
      
      if (error) {
        console.error(`❌ Error al restaurar ubicación ${location.name}:`, error.message)
      } else {
        console.log(`✅ Ubicación restaurada: ${location.name}`)
      }
    }
    
    // 5. Restaurar registros de tiempo (en lotes para evitar timeouts)
    console.log('\n⏰ Restaurando registros de tiempo...')
    const timeRecords = backupData.tables.time_records || []
    const batchSize = 50
    let restoredCount = 0
    
    for (let i = 0; i < timeRecords.length; i += batchSize) {
      const batch = timeRecords.slice(i, i + batchSize)
      
      // Preparar datos del lote
      const batchData = batch.map(record => {
        const { id, created_at, updated_at, ...recordData } = record
        return recordData
      })
      
      console.log(`📤 Restaurando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(timeRecords.length / batchSize)} (${batch.length} registros)...`)
      
      const { data, error } = await supabase
        .from('time_records')
        .insert(batchData)
        .select()
      
      if (error) {
        console.error(`❌ Error al restaurar lote:`, error.message)
      } else {
        restoredCount += batch.length
        console.log(`✅ Lote restaurado. Total procesado: ${restoredCount}/${timeRecords.length}`)
      }
      
      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n🎉 ¡Restauración completada exitosamente!')
    console.log(`📊 Resumen de la restauración:`)
    console.log(`  - Empleados: ${employees.length}`)
    console.log(`  - Centros de trabajo: ${workCenters.length}`)
    console.log(`  - Registros de tiempo: ${restoredCount}`)
    console.log(`  - Configuraciones: ${settings.length}`)
    console.log(`  - Ubicaciones autorizadas: ${locations.length}`)
    
  } catch (error) {
    console.error('❌ Error durante la restauración:', error.message)
    throw error
  }
}

// Función para verificar la conexión con el nuevo proyecto
async function verifyConnection() {
  try {
    console.log('🔍 Verificando conexión con el nuevo proyecto...')
    
    const { data, error } = await supabase
      .from('employees')
      .select('count', { count: 'exact' })
    
    if (error) {
      console.error('❌ Error de conexión:', error.message)
      console.log('\n🔧 PASOS PARA CONFIGURAR:')
      console.log('1. Crea un nuevo proyecto en Supabase')
      console.log('2. Ejecuta las migraciones SQL (complete-migration.sql)')
      console.log('3. Actualiza NEW_SUPABASE_URL y NEW_SUPABASE_ANON_KEY en este script')
      console.log('4. Vuelve a ejecutar este script')
      return false
    }
    
    console.log('✅ Conexión exitosa con el nuevo proyecto')
    return true
    
  } catch (error) {
    console.error('❌ Error de verificación:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando proceso de restauración...')
  
  // Verificar conexión
  const isConnected = await verifyConnection()
  if (!isConnected) {
    return
  }
  
  // Buscar archivo de backup más reciente
  const backupFiles = fs.readdirSync('.')
    .filter(file => file.startsWith('backup-miticaje-') && file.endsWith('.json'))
    .sort()
    .reverse()
  
  if (backupFiles.length === 0) {
    console.error('❌ No se encontraron archivos de backup')
    console.log('💡 Ejecuta primero: node backup-template.js')
    return
  }
  
  const latestBackup = backupFiles[0]
  console.log(`📄 Usando backup: ${latestBackup}`)
  
  await restoreBackup(latestBackup)
}

// Ejecutar solo si se proporciona confirmación
if (process.argv.includes('--confirm')) {
  main().catch(console.error)
} else {
  console.log('⚠️  IMPORTANTE: Este script restaurará datos en un nuevo proyecto Supabase')
  console.log('📋 Antes de ejecutar:')
  console.log('1. Crea un nuevo proyecto en Supabase')
  console.log('2. Ejecuta las migraciones SQL (complete-migration.sql)')
  console.log('3. Actualiza NEW_SUPABASE_URL y NEW_SUPABASE_ANON_KEY en este script')
  console.log('4. Ejecuta: node restore-template.js --confirm')
}
