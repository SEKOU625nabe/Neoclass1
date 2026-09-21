/**
 * NEOCLASS — Système de Gestion Budgétaire
 * Module pour créer, suivre et ajuster les budgets par département et année
 */

class BudgetManager {
  constructor(schoolId = 'default') {
    this.schoolId = schoolId;
    this.budgets = [];
    this.departments = [
      { id: 'pedagogy', name: 'Pédagogie', description: 'Cours, matériel, formation' },
      { id: 'hr', name: 'Ressources Humaines', description: 'Salaires, avantages' },
      { id: 'operations', name: 'Opérations', description: 'Maintenance, utilities, transports' },
      { id: 'admin', name: 'Administration', description: 'Bureaux, équipements' },
      { id: 'it', name: 'Technologie', description: 'Systèmes IT, infrastructure' },
      { id: 'marketing', name: 'Communication', description: 'Marketing, événements' }
    ];

    this.loadBudgets();
  }

  /**
   * Créer un nouveau budget
   */
  createBudget(data) {
    const budget = {
      id: `budget_${Date.now()}`,
      year: data.year,
      department: data.department,
      status: 'draft', // draft, approved, executing, closed
      
      // Allocations
      totalAllocated: parseFloat(data.totalAllocated),
      currency: data.currency || 'XOF',
      
      // Items de budget
      items: data.items || [], // [{ category, allocation, spent: 0 }]
      
      // Détails
      description: data.description || '',
      notes: [],
      
      // Responsable
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      
      // Tracking
      spent: 0,
      committed: 0,
      remaining: parseFloat(data.totalAllocated),
      utilizationRate: 0
    };

    this.budgets.push(budget);
    this.saveBudgets();
    return budget;
  }

  /**
   * Approuver un budget
   */
  approveBudget(budgetId, approverId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    budget.status = 'approved';
    budget.approvedBy = approverId;
    budget.approvedAt = new Date().toISOString();
    budget.notes.push({
      type: 'approval',
      author: approverId,
      text: 'Budget approuvé',
      timestamp: new Date().toISOString()
    });

    this.saveBudgets();
    return budget;
  }

  /**
   * Commencer l'exécution d'un budget
   */
  executeBudget(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget || budget.status !== 'approved') return null;

    budget.status = 'executing';
    this.saveBudgets();
    return budget;
  }

  /**
   * Clôturer un budget
   */
  closeBudget(budgetId, notes = '') {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    budget.status = 'closed';
    if (notes) budget.notes.push({
      type: 'closure',
      text: notes,
      timestamp: new Date().toISOString()
    });

    this.saveBudgets();
    return budget;
  }

  /**
   * Ajouter une dépense au budget
   */
  recordExpense(budgetId, categoryId, amount) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    const item = budget.items.find(i => i.category === categoryId);
    if (item) {
      item.spent = (item.spent || 0) + amount;
    }

    budget.spent += amount;
    budget.remaining = budget.totalAllocated - budget.spent - budget.committed;
    budget.utilizationRate = (budget.spent / budget.totalAllocated) * 100;

    this.saveBudgets();
    return budget;
  }

  /**
   * Engager un montant (dépense prévue mais non encore exécutée)
   */
  commitAmount(budgetId, categoryId, amount) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    budget.committed += amount;
    budget.remaining = budget.totalAllocated - budget.spent - budget.committed;

    this.saveBudgets();
    return budget;
  }

  /**
   * Obtenir les budgets par année
   */
  getBudgetsByYear(year) {
    return this.budgets.filter(b => b.year === year);
  }

  /**
   * Obtenir les budgets par département
   */
  getBudgetsByDepartment(departmentId) {
    return this.budgets.filter(b => b.department === departmentId);
  }

  /**
   * Obtenir les budgets par statut
   */
  getBudgetsByStatus(status) {
    return this.budgets.filter(b => b.status === status);
  }

  /**
   * Obtenir un budget avec ses détails
   */
  getBudgetDetails(budgetId) {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    const department = this.departments.find(d => d.id === budget.department);
    
    return {
      ...budget,
      departmentName: department?.name,
      percentageUsed: Math.round((budget.spent / budget.totalAllocated) * 100),
      status: this.getBudgetStatus(budget),
      availableFunds: budget.remaining
    };
  }

  /**
   * Analyser les budgets par département
   */
  analyzeByDepartment(year) {
    const analysis = {};
    
    this.departments.forEach(dept => {
      const deptBudgets = this.budgets.filter(b => b.department === dept.id && b.year === year);
      const totalAllocated = deptBudgets.reduce((sum, b) => sum + b.totalAllocated, 0);
      const totalSpent = deptBudgets.reduce((sum, b) => sum + b.spent, 0);
      
      analysis[dept.id] = {
        name: dept.name,
        allocated: totalAllocated,
        spent: totalSpent,
        remaining: totalAllocated - totalSpent,
        utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0
      };
    });

    return analysis;
  }

  /**
   * Générer un rapport budgétaire
   */
  generateBudgetReport(year) {
    const yearBudgets = this.getBudgetsByYear(year);
    const analysis = this.analyzeByDepartment(year);
    
    const totalAllocated = yearBudgets.reduce((sum, b) => sum + b.totalAllocated, 0);
    const totalSpent = yearBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalCommitted = yearBudgets.reduce((sum, b) => sum + b.committed, 0);

    return {
      year: year,
      summary: {
        totalAllocated: totalAllocated,
        totalSpent: totalSpent,
        totalCommitted: totalCommitted,
        remaining: totalAllocated - totalSpent,
        utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
        commitmentRate: totalAllocated > 0 ? Math.round(((totalSpent + totalCommitted) / totalAllocated) * 100) : 0
      },
      byDepartment: analysis,
      budgetCount: yearBudgets.length,
      executingBudgets: yearBudgets.filter(b => b.status === 'executing').length,
      approvedBudgets: yearBudgets.filter(b => b.status === 'approved').length
    };
  }

  /**
   * Obtenir les budgets approches de la limite
   */
  getAlertBudgets() {
    return this.budgets
      .filter(b => b.status === 'executing')
      .map(b => ({
        id: b.id,
        department: b.department,
        utilizationRate: b.utilizationRate,
        status: this.getBudgetStatus(b)
      }))
      .filter(b => b.utilizationRate > 80);
  }

  /**
   * Obtenir le statut d'un budget
   */
  getBudgetStatus(budget) {
    if (budget.utilizationRate >= 100) return 'Dépassé';
    if (budget.utilizationRate >= 85) return 'Critique';
    if (budget.utilizationRate >= 70) return 'Élevé';
    return 'Normal';
  }

  /**
   * Ajuster un budget
   */
  adjustBudget(budgetId, newAllocation, reason = '') {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return null;

    const adjustment = newAllocation - budget.totalAllocated;
    budget.totalAllocated = newAllocation;
    budget.remaining = budget.totalAllocated - budget.spent - budget.committed;
    budget.utilizationRate = (budget.spent / budget.totalAllocated) * 100;

    budget.notes.push({
      type: 'adjustment',
      text: `Ajustement de ${adjustment > 0 ? '+' : ''}${adjustment}. ${reason}`,
      timestamp: new Date().toISOString()
    });

    this.saveBudgets();
    return budget;
  }

  /**
   * Charger les budgets depuis localStorage
   */
  loadBudgets() {
    // Budgets pré-chargés pour la démo
    this.budgets = [
      {
        id: 'budget_2025_pedagogy',
        year: 2025,
        department: 'pedagogy',
        status: 'executing',
        totalAllocated: 50000000,
        currency: 'XOF',
        items: [
          { category: 'salaries', allocation: 30000000, spent: 18000000 },
          { category: 'materials', allocation: 15000000, spent: 8500000 },
          { category: 'training', allocation: 5000000, spent: 2000000 }
        ],
        description: 'Budget annuel pédagogie 2025',
        notes: [],
        createdBy: 'member_2',
        createdAt: '2024-12-01T00:00:00Z',
        approvedBy: 'member_2',
        approvedAt: '2024-12-15T00:00:00Z',
        spent: 28500000,
        committed: 5000000,
        remaining: 16500000,
        utilizationRate: 57
      },
      {
        id: 'budget_2025_hr',
        year: 2025,
        department: 'hr',
        status: 'executing',
        totalAllocated: 120000000,
        currency: 'XOF',
        items: [
          { category: 'salaries', allocation: 115000000, spent: 91200000 },
          { category: 'benefits', allocation: 5000000, spent: 3200000 }
        ],
        description: 'Budget RH 2025',
        notes: [],
        createdBy: 'member_2',
        createdAt: '2024-12-01T00:00:00Z',
        approvedBy: 'member_2',
        approvedAt: '2024-12-15T00:00:00Z',
        spent: 94400000,
        committed: 8000000,
        remaining: 17600000,
        utilizationRate: 79
      },
      {
        id: 'budget_2025_operations',
        year: 2025,
        department: 'operations',
        status: 'executing',
        totalAllocated: 30000000,
        currency: 'XOF',
        items: [
          { category: 'maintenance', allocation: 12000000, spent: 7200000 },
          { category: 'utilities', allocation: 10000000, spent: 8500000 },
          { category: 'transport', allocation: 8000000, spent: 4800000 }
        ],
        description: 'Budget opérationnel 2025',
        notes: [],
        createdBy: 'member_2',
        createdAt: '2024-12-01T00:00:00Z',
        approvedBy: 'member_2',
        approvedAt: '2024-12-15T00:00:00Z',
        spent: 20500000,
        committed: 3000000,
        remaining: 6500000,
        utilizationRate: 68
      }
    ];
  }

  /**
   * Sauvegarder les budgets
   */
  saveBudgets() {
    localStorage.setItem(`neoclass_budgets_${this.schoolId}`, JSON.stringify(this.budgets));
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = BudgetManager;
}
