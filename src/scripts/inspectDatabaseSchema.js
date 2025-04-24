import { supabase } from '../lib/supabaseClient';

const inspectDatabaseSchema = async () => {
  try {
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    console.log('Tables in the database:', tables);

    for (const table of tables) {
      const { tablename } = table;
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_name', tablename);

      if (columnError) {
        console.error(`Error fetching columns for table ${tablename}:`, columnError);
        continue;
      }

      console.log(`Columns in table ${tablename}:`, columns);
    }
  } catch (err) {
    console.error('Error inspecting database schema:', err);
  }
};

inspectDatabaseSchema();