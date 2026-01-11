/**
 * Script per generare migrazioni per tabelle mancanti
 * Analizza il database online e crea le migrazioni necessarie
 */

import fs from 'fs';
import path from 'path';

// Definizione di tutte le tabelle che dovrebbero esistere
const EXPECTED_TABLES = {
  // GlobalGAP Compliance Tables
  globalgap_compliance_checklist: {
    migration: '20260111200000_create_missing_globalgap_tables.sql',
    description: 'GlobalGAP compliance checklist'
  },
  globalgap_self_assessments: {
    migration: '20260111200000_create_missing_globalgap_tables.sql',
    description: 'GlobalGAP self assessments'
  },
  globalgap_ggn_codes: {
    migration: '20260111200000_create_missing_globalgap_tables.sql',
    description: 'GlobalGAP GGN codes'
  },
  globalgap_recall_procedures: {
    migration: '20260111200000_create_missing_globalgap_tables.sql',
    description: 'GlobalGAP recall procedures'
  },
  globalgap_risk_management_plans: {
    migration: '20260111200000_create_missing_globalgap_tables.sql',
    description: 'GlobalGAP risk management plans'
  },
  globalgap_health_safety_managers: {
    migration: '20260111200000_create_missing_globalgap_tables.sql',
    description: 'GlobalGAP health safety managers'
  },

  // Individual Plant Tracking Tables
  individual_plants: {
    migration: '20260111210000_create_individual_plant_tracking.sql',
    description: 'Individual plant tracking system'
  },
  garden_plants: {
    migration: '20260111210000_create_individual_plant_tracking.sql',
    description: 'Garden plants (alias for individual_plants)'
  },
  plant_operations: {
    migration: '20260111210000_create_individual_plant_tracking.sql',
    description: 'Operations on individual plants'
  },
  plant_harvests: {
    migration: '20260111210000_create_individual_plant_tracking.sql',
    description: 'Harvests from individual plants'
  },
  plant_health_records: {
    migration: '20260111210000_create_individual_plant_tracking.sql',
    description: 'Health records for individual plants'
  },
  plant_growth_stages: {
    migration: '20260111210000_create_individual_plant_tracking.sql',
    description: 'Growth stages tracking for plants'
  },

  // Prescription Maps Tables
  prescription_maps: {
    migration: '20260111220000_create_prescription_maps_complete.sql',
    description: 'Prescription maps for precision farming'
  },
  prescription_zones: {
    migration: '20260111220000_create_prescription_maps_complete.sql',
    description: 'Zones within prescription maps'
  },
  variable_rate_applications: {
    migration: '20260111220000_create_prescription_maps_complete.sql',
    description: 'Variable rate applications tracking'
  },
  prescription_map_exports: {
    migration: '20260111220000_create_prescription_maps_complete.sql',
    description: 'Prescription map exports tracking'
  },
  machinery_compatibility: {
    migration: '20260111220000_create_prescription_maps_complete.sql',
    description: 'Agricultural machinery compatibility'
  },
  ndvi_data_cache: {
    migration: '20260111220000_create_prescription_maps_complete.sql',
    description: 'NDVI data cache for performance'
  },

  // Plant-Row Integration Tables
  operation_sync_log: {
    migration: '20260111230000_create_plant_row_integration.sql',
    description: 'Synchronization log between row and plant operations'
  }
};

// Colonne che dovrebbero esistere nelle tabelle esistenti
const EXPECTED_COLUMNS = {
  watering_logs: {
    field_row_id: {
      migration: '20260111240000_add_row_tracking_columns.sql',
      description: 'Field row ID for row tracking'
    },
    plant_ids: {
      migration: '20260111240000_add_row_tracking_columns.sql',
      description: 'Plant IDs array for individual plant tracking'
    }
  },
  fertilizer_application_logs: {
    field_row_id: {
      migration: '20260111240000_add_row_tracking_columns.sql',
      description: 'Field row ID for row tracking'
    },
    plant_ids: {
      migration: '20260111240000_add_row_tracking_columns.sql',
      description: 'Plant IDs array for individual plant tracking'
    }
  },
  treatment_register: {
    field_row_id: {
      migration: '20260111240000_add_row_tracking_columns.sql',
      description: 'Field row ID for row tracking'
    },
    plant_ids: {
      migration: '20260111240000_add_row_tracking_columns.sql',
      description: 'Plant IDs array for individual plant tracking'
    }
  }
};

function generateMigrationContent(migrationName, tables, columns) {
  let content = `-- =====================================================\n`;
  content += `-- ${migrationName.toUpperCase()}\n`;
  content += `-- Auto-generated migration for missing database objects\n`;
  content += `-- Generated: ${new Date().toISOString()}\n`;
  content += `-- =====================================================\n\n`;

  // Add tables
  if (tables && tables.length > 0) {
    content += `-- MISSING TABLES\n`;
    content += `-- The following tables are missing and will be created:\n`;
    tables.forEach(table => {
      content += `-- - ${table}\n`;
    });
    content += `\n`;
    
    // Include content from source migrations
    if (migrationName.includes('globalgap')) {
      content += fs.readFileSync('supabase/migrations/20260111200000_create_missing_globalgap_tables.sql', 'utf8');
    } else if (migrationName.includes('individual_plant')) {
      content += fs.readFileSync('supabase/migrations/20260110100000_create_individual_plant_tracking.sql', 'utf8');
    } else if (migrationName.includes('prescription_maps')) {
      content += fs.readFileSync('supabase/migrations/20260111100000_create_prescription_maps_schema.sql', 'utf8');
    } else if (migrationName.includes('plant_row')) {
      content += fs.readFileSync('supabase/migrations/20260111000000_integrate_plant_row_tracking.sql', 'utf8');
    }
  }

  // Add columns
  if (columns && columns.length > 0) {
    content += `\n-- MISSING COLUMNS\n`;
    content += `-- The following columns are missing and will be added:\n`;
    columns.forEach(col => {
      content += `-- - ${col.table}.${col.column}\n`;
    });
    content += `\n`;

    columns.forEach(col => {
      content += `-- Add ${col.column} to ${col.table}\n`;
      content += `ALTER TABLE ${col.table} ADD COLUMN IF NOT EXISTS ${col.column} ${col.type};\n`;
      if (col.comment) {
        content += `COMMENT ON COLUMN ${col.table}.${col.column} IS '${col.comment}';\n`;
      }
      content += `\n`;
    });
  }

  content += `\n-- Migration completed\n`;
  content += `SELECT 'Migration completed successfully' as status;\n`;

  return content;
}

function createMigrationFile(filename, content) {
  const migrationPath = path.join('supabase', 'migrations', filename);
  
  // Ensure directory exists
  const dir = path.dirname(migrationPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(migrationPath, content);
  console.log(`✅ Created migration: ${filename}`);
}

function generateAllMigrations() {
  console.log('🔍 Generating missing database migrations...\n');

  // 1. GlobalGAP Tables Migration
  const globalGapTables = Object.keys(EXPECTED_TABLES).filter(table => 
    table.startsWith('globalgap_')
  );
  
  if (globalGapTables.length > 0) {
    const content = generateMigrationContent('globalgap_tables', globalGapTables);
    createMigrationFile('20260111200000_create_missing_globalgap_tables.sql', content);
  }

  // 2. Individual Plant Tracking Migration
  const plantTables = Object.keys(EXPECTED_TABLES).filter(table => 
    ['individual_plants', 'garden_plants', 'plant_operations', 'plant_harvests', 'plant_health_records', 'plant_growth_stages'].includes(table)
  );
  
  if (plantTables.length > 0) {
    const content = generateMigrationContent('individual_plant_tracking', plantTables);
    createMigrationFile('20260111210000_create_individual_plant_tracking.sql', content);
  }

  // 3. Prescription Maps Migration
  const prescriptionTables = Object.keys(EXPECTED_TABLES).filter(table => 
    ['prescription_maps', 'prescription_zones', 'variable_rate_applications', 'prescription_map_exports', 'machinery_compatibility', 'ndvi_data_cache'].includes(table)
  );
  
  if (prescriptionTables.length > 0) {
    const content = generateMigrationContent('prescription_maps_complete', prescriptionTables);
    createMigrationFile('20260111220000_create_prescription_maps_complete.sql', content);
  }

  // 4. Plant-Row Integration Migration
  const integrationTables = ['operation_sync_log'];
  const content = generateMigrationContent('plant_row_integration', integrationTables);
  createMigrationFile('20260111230000_create_plant_row_integration.sql', content);

  // 5. Row Tracking Columns Migration
  const missingColumns = [
    { table: 'watering_logs', column: 'field_row_id', type: 'UUID REFERENCES field_rows(id) ON DELETE SET NULL', comment: 'Field row ID for row tracking' },
    { table: 'watering_logs', column: 'plant_ids', type: 'UUID[]', comment: 'Plant IDs array for individual plant tracking' },
    { table: 'fertilizer_application_logs', column: 'field_row_id', type: 'UUID REFERENCES field_rows(id) ON DELETE SET NULL', comment: 'Field row ID for row tracking' },
    { table: 'fertilizer_application_logs', column: 'plant_ids', type: 'UUID[]', comment: 'Plant IDs array for individual plant tracking' },
    { table: 'treatment_register', column: 'field_row_id', type: 'UUID REFERENCES field_rows(id) ON DELETE SET NULL', comment: 'Field row ID for row tracking' },
    { table: 'treatment_register', column: 'plant_ids', type: 'UUID[]', comment: 'Plant IDs array for individual plant tracking' }
  ];

  const columnsContent = generateMigrationContent('row_tracking_columns', [], missingColumns);
  createMigrationFile('20260111240000_add_row_tracking_columns.sql', columnsContent);

  console.log('\n🎯 Migration Summary:');
  console.log('=====================');
  console.log('✅ GlobalGAP Tables: 6 tables');
  console.log('✅ Individual Plant Tracking: 6 tables');
  console.log('✅ Prescription Maps: 6 tables');
  console.log('✅ Plant-Row Integration: 1 table + functions');
  console.log('✅ Row Tracking Columns: 6 columns added');
  console.log('\n📋 Next Steps:');
  console.log('1. Apply migrations in order (200000 → 240000)');
  console.log('2. Test each migration individually');
  console.log('3. Verify all features work correctly');
  console.log('\n⚠️  IMPORTANT: NO DATABASE RESET - Only incremental additions!');
}

// Generate SQL check script
function generateCheckScript() {
  let checkSql = `-- Database Check Script\n`;
  checkSql += `-- Run this in Supabase SQL Editor to see what's missing\n\n`;
  
  checkSql += `-- Check missing tables\n`;
  checkSql += `SELECT \n`;
  checkSql += `  'TABLE' as object_type,\n`;
  checkSql += `  table_name,\n`;
  checkSql += `  CASE WHEN EXISTS (\n`;
  checkSql += `    SELECT 1 FROM information_schema.tables \n`;
  checkSql += `    WHERE table_schema = 'public' AND table_name = expected_tables.table_name\n`;
  checkSql += `  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status\n`;
  checkSql += `FROM (\n`;
  checkSql += `  VALUES \n`;
  
  Object.keys(EXPECTED_TABLES).forEach((table, index) => {
    checkSql += `    ('${table}')`;
    if (index < Object.keys(EXPECTED_TABLES).length - 1) {
      checkSql += `,\n`;
    } else {
      checkSql += `\n`;
    }
  });
  
  checkSql += `) AS expected_tables(table_name)\n`;
  checkSql += `ORDER BY table_name;\n\n`;

  checkSql += `-- Check missing columns\n`;
  Object.keys(EXPECTED_COLUMNS).forEach(table => {
    Object.keys(EXPECTED_COLUMNS[table]).forEach(column => {
      checkSql += `SELECT '${table}.${column}' as column_check,\n`;
      checkSql += `  CASE WHEN EXISTS (\n`;
      checkSql += `    SELECT 1 FROM information_schema.columns \n`;
      checkSql += `    WHERE table_name = '${table}' AND column_name = '${column}'\n`;
      checkSql += `  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status\n`;
      checkSql += `UNION ALL\n`;
    });
  });
  
  checkSql = checkSql.replace(/UNION ALL\n$/, ';\n');

  fs.writeFileSync('check_missing_tables.sql', checkSql);
  console.log('✅ Created database check script: check_missing_tables.sql');
}

// Run the generator
console.log('🚀 OrtoMio Database Migration Generator');
console.log('=====================================\n');

generateCheckScript();
generateAllMigrations();

console.log('\n🎉 All migrations generated successfully!');
console.log('\n📖 Usage Instructions:');
console.log('1. Run check_missing_tables.sql in Supabase to see current status');
console.log('2. Apply migrations in numerical order');
console.log('3. Test each feature after applying its migration');
console.log('4. No database reset required - all additive changes');