// Script template para crear backup completo de Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// CONFIGURAR ESTAS VARIABLES CON TU PROYECTO ACTUAL
const supabaseUrl = 'https://TU-PROYECTO-ACTUAL.supabase.co'
const anonKey = 'TU-ANON-KEY-ACTUAL'

const supabase = createClient(supabaseUrl, anonKey)

async function createBackup() {
  console.log('📦 Creando backup completo de Supabase...')
  
  const backup = {
    timestamp: new Date().toISOString(),
    source_project: 'TU-PROJECT-ID',
    tables: {}
  }
  
  try {
    // 1. Backup de empleados
    console.log('👥 Respaldando empleados...')
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .order('created_at')
    
    if (empError) throw empError
    backup.tables.employees = employees
    console.log(`✅ ${employees.length} empleados respaldados`)
    
    // 2. Backup de centros de trabajo
    console.log('🏢 Respaldando centros de trabajo...')
    const { data: workCenters, error: wcError } = await supabase
      .from('work_centers')
      .select('*')
      .order('created_at')
    
    if (wcError) throw wcError
    backup.tables.work_centers = workCenters
    console.log(`✅ ${workCenters.length} centros de trabajo respaldados`)
    
    // 3. Backup de registros de tiempo
    console.log('⏰ Respaldando registros de tiempo...')
    const { data: timeRecords, error: trError } = await supabase
      .from('time_records')
      .select('*')
      .order('timestamp')
    
    if (trError) throw trError
    backup.tables.time_records = timeRecords
    console.log(`✅ ${timeRecords.length} registros de tiempo respaldados`)
    
    // 4. Backup de configuraciones
    console.log('⚙️ Respaldando configuraciones...')
    const { data: settings, error: setError } = await supabase
      .from('app_settings')
      .select('*')
      .order('key')
    
    if (setError) throw setError
    backup.tables.app_settings = settings
    console.log(`✅ ${settings.length} configuraciones respaldadas`)
    
    // 5. Backup de ubicaciones autorizadas
    console.log('📍 Respaldando ubicaciones autorizadas...')
    const { data: locations, error: locError } = await supabase
      .from('authorized_locations')
      .select('*')
      .order('created_at')
    
    if (locError) throw locError
    backup.tables.authorized_locations = locations
    console.log(`✅ ${locations.length} ubicaciones autorizadas respaldadas`)
    
    // Guardar backup en archivo JSON
    const backupFileName = `backup-miticaje-${new Date().toISOString().split('T')[0]}.json`
    fs.writeFileSync(backupFileName, JSON.stringify(backup, null, 2))
    
    console.log('\n🎉 ¡Backup completado exitosamente!')
    console.log(`📄 Archivo: ${backupFileName}`)
    console.log(`📊 Resumen del backup:`)
    console.log(`  - Empleados: ${backup.tables.employees.length}`)
    console.log(`  - Centros de trabajo: ${backup.tables.work_centers.length}`)
    console.log(`  - Registros de tiempo: ${backup.tables.time_records.length}`)
    console.log(`  - Configuraciones: ${backup.tables.app_settings.length}`)
    console.log(`  - Ubicaciones autorizadas: ${backup.tables.authorized_locations.length}`)
    
    return backupFileName
    
  } catch (error) {
    console.error('❌ Error al crear backup:', error.message)
    throw error
  }
}

// Ejecutar backup
createBackup().catch(console.error)
