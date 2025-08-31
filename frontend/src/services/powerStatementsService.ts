export interface PowerStatement {
  id: string;
  text: string;
  category: 'wealth' | 'health' | 'success' | 'relationships' | 'spiritual';
  color: string;
  active: boolean;
  order: number;
}

class PowerStatementsService {
  private readonly STORAGE_KEY = 'power-statements';
  
  private defaultStatements: PowerStatement[] = [
    {
      id: '1',
      text: 'I am whole, perfect, strong, powerful, loving, harmonious, and happy',
      category: 'spiritual',
      color: 'from-purple-500 to-pink-500',
      active: true,
      order: 1
    },
    {
      id: '2',
      text: 'Infinite intelligence leads me and guides me in all my ways',
      category: 'success',
      color: 'from-blue-500 to-purple-500',
      active: true,
      order: 2
    },
    {
      id: '3',
      text: 'I am one with infinite abundance. Wealth flows to me freely and easily',
      category: 'wealth',
      color: 'from-green-500 to-emerald-500',
      active: true,
      order: 3
    },
    {
      id: '4',
      text: 'The healing power within me is now transforming every cell of my body',
      category: 'health',
      color: 'from-pink-500 to-red-500',
      active: true,
      order: 4
    },
    {
      id: '5',
      text: 'Divine order is established in my mind, body, and affairs',
      category: 'spiritual',
      color: 'from-indigo-500 to-purple-500',
      active: true,
      order: 5
    }
  ];

  getStatements(): PowerStatement[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored power statements:', e);
      }
    }
    // Initialize with default statements
    this.saveStatements(this.defaultStatements);
    return this.defaultStatements;
  }

  saveStatements(statements: PowerStatement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(statements));
  }

  getActiveStatements(): PowerStatement[] {
    return this.getStatements().filter(s => s.active);
  }

  getRandomActiveStatement(): PowerStatement | null {
    const active = this.getActiveStatements();
    if (active.length === 0) return null;
    return active[Math.floor(Math.random() * active.length)];
  }

  getStatementsByCategory(category: PowerStatement['category']): PowerStatement[] {
    return this.getStatements().filter(s => s.category === category && s.active);
  }

  getTimeBasedStatement(): PowerStatement | null {
    const hour = new Date().getHours();
    const active = this.getActiveStatements();
    if (active.length === 0) return null;
    
    // Morning: spiritual or success
    if (hour >= 5 && hour < 12) {
      const morning = active.filter(s => s.category === 'spiritual' || s.category === 'success');
      return morning.length > 0 ? morning[Math.floor(Math.random() * morning.length)] : active[0];
    }
    // Afternoon: wealth or success
    else if (hour >= 12 && hour < 18) {
      const afternoon = active.filter(s => s.category === 'wealth' || s.category === 'success');
      return afternoon.length > 0 ? afternoon[Math.floor(Math.random() * afternoon.length)] : active[0];
    }
    // Evening: health or relationships or spiritual
    else {
      const evening = active.filter(s => s.category === 'health' || s.category === 'relationships' || s.category === 'spiritual');
      return evening.length > 0 ? evening[Math.floor(Math.random() * evening.length)] : active[0];
    }
  }

  addStatement(statement: Omit<PowerStatement, 'id' | 'order'>): PowerStatement {
    const statements = this.getStatements();
    const newStatement: PowerStatement = {
      ...statement,
      id: Date.now().toString(),
      order: statements.length + 1
    };
    statements.push(newStatement);
    this.saveStatements(statements);
    return newStatement;
  }

  updateStatement(id: string, updates: Partial<PowerStatement>): boolean {
    const statements = this.getStatements();
    const index = statements.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    statements[index] = { ...statements[index], ...updates };
    this.saveStatements(statements);
    return true;
  }

  deleteStatement(id: string): boolean {
    const statements = this.getStatements();
    const filtered = statements.filter(s => s.id !== id);
    if (filtered.length === statements.length) return false;
    
    this.saveStatements(filtered);
    return true;
  }

  toggleActive(id: string): boolean {
    const statements = this.getStatements();
    const statement = statements.find(s => s.id === id);
    if (!statement) return false;
    
    statement.active = !statement.active;
    this.saveStatements(statements);
    return true;
  }
}

export const powerStatementsService = new PowerStatementsService();