
import { Pool } from 'pg';

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'aviator_game',
  password: '', // Add your PostgreSQL password here if needed
  port: 5432,
});

// Database client with similar interface to Supabase
export const db = {
  // User authentication methods
  auth: {
    signUp: async (email: string, password: string) => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, created_at
      `;
      
      try {
        const result = await pool.query(query, [email, hashedPassword]);
        return { data: { user: result.rows[0] }, error: null };
      } catch (error: any) {
        if (error.code === '23505') {
          return { data: null, error: { message: 'User already exists' } };
        }
        return { data: null, error: { message: error.message } };
      }
    },

    signIn: async (email: string, password: string) => {
      const bcrypt = await import('bcryptjs');
      
      const query = `
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE email = $1
      `;
      
      try {
        const result = await pool.query(query, [email]);
        if (result.rows.length === 0) {
          return { data: null, error: { message: 'Invalid login credentials' } };
        }
        
        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
          return { data: null, error: { message: 'Invalid login credentials' } };
        }
        
        // Create session data
        const userData = {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        };
        
        // Store in localStorage for session persistence
        localStorage.setItem('aviator_user', JSON.stringify(userData));
        
        return { 
          data: { 
            user: userData,
            session: { user: userData }
          }, 
          error: null 
        };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },

    signOut: async () => {
      localStorage.removeItem('aviator_user');
      return { error: null };
    },

    getSession: async () => {
      const userData = localStorage.getItem('aviator_user');
      if (userData) {
        const user = JSON.parse(userData);
        return { 
          data: { 
            session: { user },
            user 
          }, 
          error: null 
        };
      }
      return { data: { session: null, user: null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Initial session check
      const userData = localStorage.getItem('aviator_user');
      if (userData) {
        const user = JSON.parse(userData);
        callback('SIGNED_IN', { user });
      } else {
        callback('SIGNED_OUT', null);
      }

      // Listen for storage changes (for multi-tab support)
      const handler = (e: StorageEvent) => {
        if (e.key === 'aviator_user') {
          if (e.newValue) {
            const user = JSON.parse(e.newValue);
            callback('SIGNED_IN', { user });
          } else {
            callback('SIGNED_OUT', null);
          }
        }
      };

      window.addEventListener('storage', handler);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => window.removeEventListener('storage', handler)
          }
        }
      };
    }
  },

  // Database operations
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          const query = `SELECT ${columns} FROM ${table} WHERE ${column} = $1`;
          try {
            const result = await pool.query(query, [value]);
            if (result.rows.length === 0) {
              return { data: null, error: { message: 'No data found' } };
            }
            return { data: result.rows[0], error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      order: (column: string, options: { ascending: boolean }) => ({
        eq: (filterColumn: string, value: any) => ({
          execute: async () => {
            const direction = options.ascending ? 'ASC' : 'DESC';
            const query = `SELECT ${columns} FROM ${table} WHERE ${filterColumn} = $1 ORDER BY ${column} ${direction}`;
            try {
              const result = await pool.query(query, [value]);
              return { data: result.rows, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      })
    }),

    insert: (data: any) => ({
      execute: async () => {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
          INSERT INTO ${table} (${columns.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;
        
        try {
          const result = await pool.query(query, values);
          return { data: result.rows[0], error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      }
    }),

    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        execute: async () => {
          const columns = Object.keys(data);
          const values = Object.values(data);
          const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
          
          const query = `
            UPDATE ${table} 
            SET ${setClause}
            WHERE ${column} = $${values.length + 1}
            RETURNING *
          `;
          
          try {
            const result = await pool.query(query, [...values, value]);
            return { data: result.rows[0], error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      })
    })
  })
};

export default db;
