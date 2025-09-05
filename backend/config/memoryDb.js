// In-memory database for development (no MySQL setup required)
class MemoryDatabase {
  constructor() {
    this.data = {
      clients: [
        {
          id: 1,
          company: "BuildWell Commercial",
          email: "bids@buildwell.com",
          industry: "Commercial Construction",
          automations: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          company: "Reliable Renovators",
          email: "contact@reliablerenovators.com",
          industry: "Residential Construction",
          automations: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          company: "aaa",
          email: "abhishek20040916@gmail.com",
          industry: "qq",
          automations: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      permits: [],
      filter_presets: [
        {
          id: 1,
          name: "test1",
          filter_by: "Contractor Category",
          permit_type: "Electrical",
          work_class: "Plumbing Service Line",
          contractor_category: "Driveway",
          created_at: new Date().toISOString()
        }
      ],
      automations: [
        {
          id: 1,
          name: "Abhishek",
          client_id: 3,
          frequency: "Once",
          permit_type: "Any",
          work_class: "Any",
          distribution_type: "Round Robin",
          distribution_split: "26%",
          is_active: true,
          last_run: "2025-01-14 15:30:00",
          next_run: "2025-01-15 09:00:00",
          created_at: new Date().toISOString()
        }
      ],
      export_history: [],
      email_subscriptions: [
        {
          id: '1',
          email: 'client1@example.com',
          name: 'John Smith',
          city: 'Austin',
          workClass: 'Residential',
          frequency: 'daily',
          isActive: true,
          created_at: '2024-01-01T00:00:00.000Z',
          last_sent: null
        },
        {
          id: '2',
          email: 'client2@example.com',
          name: 'Jane Doe',
          city: 'All Cities',
          workClass: 'Commercial',
          frequency: 'weekly',
          isActive: true,
          created_at: '2024-01-02T00:00:00.000Z',
          last_sent: '2024-01-15T08:00:00.000Z'
        },
        {
          id: '3',
          email: 'admin@permitplatform.com',
          name: 'System Administrator',
          city: 'All Cities',
          workClass: 'All Types',
          frequency: 'daily',
          isActive: true,
          created_at: '2024-01-03T00:00:00.000Z',
          last_sent: null
        }
      ]
    };
    this.nextId = {
      clients: 4,
      permits: 1,
      filter_presets: 2,
      automations: 2,
      export_history: 1,
      email_subscriptions: 4
    };
  }

  // Generic query method
  async query(sql, params = []) {
    console.log('Memory DB Query:', sql, params);
    
    // Parse simple SQL queries
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('select')) {
      return this.handleSelect(sql, params);
    } else if (sqlLower.startsWith('insert')) {
      return this.handleInsert(sql, params);
    } else if (sqlLower.startsWith('update')) {
      return this.handleUpdate(sql, params);
    } else if (sqlLower.startsWith('delete')) {
      return this.handleDelete(sql, params);
    }
    
    return [[], { affectedRows: 0 }];
  }

  handleSelect(sql, params) {
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('from clients')) {
      let results = [...this.data.clients];
      
      // Simple WHERE clause parsing
      if (sqlLower.includes('where')) {
        const whereIndex = sqlLower.indexOf('where');
        const whereClause = sql.substring(whereIndex + 5).trim();
        
        if (whereClause.includes('id = ?')) {
          const id = params[0];
          results = results.filter(row => row.id === id);
        }
      }
      
      // ORDER BY
      if (sqlLower.includes('order by created_at desc')) {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return [results, {}];
    }
    
    if (sqlLower.includes('from permits')) {
      let results = [...this.data.permits];
      
      // Apply filters
      if (sqlLower.includes('where')) {
        const whereIndex = sqlLower.indexOf('where');
        const whereClause = sql.substring(whereIndex + 5).trim();
        
        if (whereClause.includes('city = ?')) {
          const city = params[0];
          results = results.filter(row => row.city === city);
        }
        
        if (whereClause.includes('work_class = ?')) {
          const workClass = params[0];
          results = results.filter(row => row.work_class === workClass);
        }
        
        if (whereClause.includes('contractor like ?')) {
          const contractor = params[0];
          results = results.filter(row => row.contractor && row.contractor.includes(contractor.replace(/%/g, '')));
        }
        
        if (whereClause.includes('location like ?') || whereClause.includes('permit_id like ?')) {
          const searchTerm = params[0].replace(/%/g, '');
          results = results.filter(row => 
            (row.location && row.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (row.permit_id && row.permit_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (row.contractor && row.contractor.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
      }
      
      // ORDER BY
      if (sqlLower.includes('order by scraped_at desc')) {
        results.sort((a, b) => new Date(b.scraped_at) - new Date(a.scraped_at));
      }
      
      // LIMIT
      if (sqlLower.includes('limit ?')) {
        const limit = params[params.length - 1];
        results = results.slice(0, limit);
      }
      
      return [results, {}];
    }
    
    if (sqlLower.includes('from email_subscriptions')) {
      let results = [...this.data.email_subscriptions];
      
      // Simple WHERE clause parsing
      if (sqlLower.includes('where')) {
        const whereIndex = sqlLower.indexOf('where');
        const whereClause = sql.substring(whereIndex + 5).trim();
        
        if (whereClause.includes('id = ?')) {
          const id = params[0];
          results = results.filter(row => row.id === id);
        }
        
        if (whereClause.includes('isActive = true')) {
          results = results.filter(row => row.isActive === true);
        }
      }
      
      // ORDER BY
      if (sqlLower.includes('order by created_at desc')) {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return [results, {}];
    }
    
    return [[], {}];
  }

  handleInsert(sql, params) {
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('into clients')) {
      const newClient = {
        id: this.nextId.clients++,
        company: params[0],
        email: params[1],
        industry: params[2],
        automations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.clients.push(newClient);
      return [[], { insertId: newClient.id, affectedRows: 1 }];
    }
    
    if (sqlLower.includes('into permits')) {
      const newPermit = {
        id: this.nextId.permits++,
        permit_id: params[0],
        city: params[1],
        permit_type: params[2],
        work_class: params[3],
        issued_date: params[4],
        applied_date: params[5],
        zip_code: params[6],
        district: params[7],
        sqft: params[8],
        location: params[9],
        contractor: params[10],
        validation_amount: params[11],
        scraped_at: new Date().toISOString()
      };
      this.data.permits.push(newPermit);
      return [[], { insertId: newPermit.id, affectedRows: 1 }];
    }
    
    if (sqlLower.includes('into email_subscriptions')) {
      const newSubscription = {
        id: params[0],
        email: params[1],
        name: params[2],
        city: params[3],
        workClass: params[4],
        frequency: params[5],
        isActive: params[6],
        created_at: params[7],
        last_sent: params[8]
      };
      this.data.email_subscriptions.push(newSubscription);
      return [[], { insertId: newSubscription.id, affectedRows: 1 }];
    }
    
    return [[], { insertId: 0, affectedRows: 0 }];
  }

  handleUpdate(sql, params) {
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('update clients')) {
      const id = params[params.length - 1]; // Last param is usually the WHERE id
      const clientIndex = this.data.clients.findIndex(c => c.id === id);
      
      if (clientIndex !== -1) {
        this.data.clients[clientIndex] = {
          ...this.data.clients[clientIndex],
          company: params[0],
          email: params[1],
          industry: params[2],
          updated_at: new Date().toISOString()
        };
        return [[], { affectedRows: 1 }];
      }
    }
    
    if (sqlLower.includes('update email_subscriptions')) {
      const id = params[params.length - 1]; // Last param is usually the WHERE id
      const subscriptionIndex = this.data.email_subscriptions.findIndex(s => s.id === id);
      
      if (subscriptionIndex !== -1) {
        this.data.email_subscriptions[subscriptionIndex] = {
          ...this.data.email_subscriptions[subscriptionIndex],
          email: params[0],
          name: params[1],
          city: params[2],
          workClass: params[3],
          frequency: params[4],
          isActive: params[5]
        };
        return [[], { affectedRows: 1 }];
      }
    }
    
    return [[], { affectedRows: 0 }];
  }

  handleDelete(sql, params) {
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('delete from clients')) {
      const id = params[0];
      const initialLength = this.data.clients.length;
      this.data.clients = this.data.clients.filter(c => c.id !== id);
      return [[], { affectedRows: initialLength - this.data.clients.length }];
    }
    
    if (sqlLower.includes('delete from email_subscriptions')) {
      const id = params[0];
      const initialLength = this.data.email_subscriptions.length;
      this.data.email_subscriptions = this.data.email_subscriptions.filter(s => s.id !== id);
      return [[], { affectedRows: initialLength - this.data.email_subscriptions.length }];
    }
    
    return [[], { affectedRows: 0 }];
  }

  // Connection simulation
  async getConnection() {
    return {
      execute: (sql, params) => this.query(sql, params),
      release: () => {}
    };
  }
}

// Create singleton instance
const memoryDb = new MemoryDatabase();

// Export connection pool-like interface
const pool = {
  getConnection: () => memoryDb.getConnection()
};

const testConnection = async () => {
  console.log('✅ Memory database connected successfully');
};

module.exports = { pool, testConnection };