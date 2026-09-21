/**
 * NEOCLASS — Système de Gestion des Opérations Financières
 * Module pour enregistrer, valider et suivre toutes les transactions
 */

class FinanceOperationManager {
  constructor(schoolId = 'default') {
    this.schoolId = schoolId;
    this.operations = [];
    this.categories = [
      { id: 'scolarite', name: 'Frais de Scolarité', type: 'revenue', color: '#059669', icon: '📚' },
      { id: 'autres_revenus', name: 'Autres Revenus', type: 'revenue', color: '#0F766E', icon: '💵' },
      { id: 'salaires', name: 'Salaires', type: 'expense', color: '#DC2626', icon: '💼' },
      { id: 'materiel', name: 'Matériel Pédagogique', type: 'expense', color: '#7C3AED', icon: '📖' },
      { id: 'maintenance', name: 'Maintenance', type: 'expense', color: '#EA580C', icon: '🔧' },
      { id: 'utilities', name: 'Électricité & Eau', type: 'expense', color: '#2563EB', icon: '💡' },
      { id: 'transport', name: 'Transport Scolaire', type: 'expense', color: '#7C3AED', icon: '🚌' },
      { id: 'events', name: 'Événements & Activités', type: 'expense', color: '#C8A84B', icon: '🎉' },
      { id: 'it_systems', name: 'Système IT', type: 'expense', color: '#059669', icon: '💻' }
    ];

    this.statuses = ['pending', 'approved', 'validated', 'completed', 'rejected', 'cancelled'];
    this.operationTypes = ['income', 'expense', 'transfer', 'adjustment'];
    
    this.loadOperations();
  }

  /**
   * Créer une nouvelle opération
   */
  createOperation(data) {
    const operation = {
      id: `op_${Date.now()}`,
      date: data.date || new Date().toISOString(),
      type: data.type || 'expense', // income, expense, transfer, adjustment
      amount: parseFloat(data.amount),
      currency: data.currency || 'XOF',
      category: data.category,
      description: data.description,
      reference: data.reference || `OP-${Date.now()}`,
      
      // Détails
      responsible: data.responsible, // ID du membre responsable
      approver: null,
      validator: null,
      
      // Statuts
      status: 'pending', // pending, approved, validated, completed, rejected
      justifications: data.justifications || [], // Fichiers joints
      notes: [],
      
      // Audit
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
      updatedAt: new Date().toISOString(),
      approvalAt: null,
      completionAt: null,
      
      // Budget tracking
      budgetItem: data.budgetItem || null,
      costCenter: data.costCenter || null
    };

    this.operations.push(operation);
    this.saveOperations();
    return operation;
  }

  /**
   * Enregistrer une opération de revenu (scolarité, etc.)
   */
  recordIncome(data) {
    return this.createOperation({
      ...data,
      type: 'income',
      status: 'completed' // Les revenus sont généralement validés immédiatement
    });
  }

  /**
   * Enregistrer une opération de dépense
   */
  recordExpense(data) {
    return this.createOperation({
      ...data,
      type: 'expense',
      status: 'pending' // Nécessite approbation
    });
  }

  /**
   * Enregistrer un virement interne
   */
  recordTransfer(data) {
    return this.createOperation({
      ...data,
      type: 'transfer'
    });
  }

  /**
   * Approuver une opération (Directeur Finances)
   */
  approveOperation(operationId, approverId, notes = '') {
    const op = this.operations.find(o => o.id === operationId);
    if (!op) return null;

    op.status = 'approved';
    op.approver = approverId;
    op.approvalAt = new Date().toISOString();
    if (notes) op.notes.push({ type: 'approval', author: approverId, text: notes, timestamp: new Date().toISOString() });
    
    this.saveOperations();
    return op;
  }

  /**
   * Valider une opération (Admin Comptable)
   */
  validateOperation(operationId, validatorId, notes = '') {
    const op = this.operations.find(o => o.id === operationId);
    if (!op || op.status !== 'approved') return null;

    op.status = 'validated';
    op.validator = validatorId;
    if (notes) op.notes.push({ type: 'validation', author: validatorId, text: notes, timestamp: new Date().toISOString() });
    
    this.saveOperations();
    return op;
  }

  /**
   * Compléter une opération (Trésorier)
   */
  completeOperation(operationId, completerId) {
    const op = this.operations.find(o => o.id === operationId);
    if (!op || op.status !== 'validated') return null;

    op.status = 'completed';
    op.completionAt = new Date().toISOString();
    op.notes.push({ type: 'completion', author: completerId, text: 'Opération exécutée', timestamp: new Date().toISOString() });
    
    this.saveOperations();
    return op;
  }

  /**
   * Rejeter une opération
   */
  rejectOperation(operationId, rejectorId, reason = '') {
    const op = this.operations.find(o => o.id === operationId);
    if (!op) return null;

    op.status = 'rejected';
    op.notes.push({ type: 'rejection', author: rejectorId, text: reason || 'Opération rejetée', timestamp: new Date().toISOString() });
    
    this.saveOperations();
    return op;
  }

  /**
   * Obtenir les opérations par statut
   */
  getOperationsByStatus(status) {
    return this.operations.filter(o => o.status === status);
  }

  /**
   * Obtenir les opérations par catégorie
   */
  getOperationsByCategory(categoryId) {
    return this.operations.filter(o => o.category === categoryId);
  }

  /**
   * Obtenir les opérations sur une période
   */
  getOperationsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.operations.filter(o => {
      const opDate = new Date(o.date);
      return opDate >= start && opDate <= end;
    });
  }

  /**
   * Obtenir les statistiques financières
   */
  getFinancialStats(period = 'month') {
    let startDate, endDate = new Date();
    
    if (period === 'month') {
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(endDate.getFullYear(), 0, 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(endDate.getMonth() / 3);
      startDate = new Date(endDate.getFullYear(), quarter * 3, 1);
    }

    const opsInPeriod = this.getOperationsByDateRange(startDate, endDate);
    
    const income = opsInPeriod
      .filter(o => o.type === 'income' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);
    
    const expenses = opsInPeriod
      .filter(o => o.type === 'expense' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);
    
    const pending = opsInPeriod
      .filter(o => o.status === 'pending')
      .reduce((sum, o) => sum + o.amount, 0);
    
    const balance = income - expenses;

    return {
      period,
      totalIncome: income,
      totalExpenses: expenses,
      balance: balance,
      pendingAmount: pending,
      operationCount: opsInPeriod.length,
      completedCount: opsInPeriod.filter(o => o.status === 'completed').length,
      pendingCount: opsInPeriod.filter(o => o.status === 'pending').length
    };
  }

  /**
   * Obtenir les catégories de dépenses
   */
  getExpenseBreakdown() {
    const breakdown = {};
    this.categories.filter(c => c.type === 'expense').forEach(cat => {
      const amount = this.operations
        .filter(o => o.category === cat.id && o.status === 'completed')
        .reduce((sum, o) => sum + o.amount, 0);
      breakdown[cat.id] = { ...cat, amount };
    });
    return breakdown;
  }

  /**
   * Ajouter une justification à une opération
   */
  addJustification(operationId, file) {
    const op = this.operations.find(o => o.id === operationId);
    if (!op) return null;

    op.justifications.push({
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    });

    this.saveOperations();
    return op;
  }

  /**
   * Ajouter une note à une opération
   */
  addNote(operationId, authorId, text) {
    const op = this.operations.find(o => o.id === operationId);
    if (!op) return null;

    op.notes.push({
      type: 'comment',
      author: authorId,
      text: text,
      timestamp: new Date().toISOString()
    });

    this.saveOperations();
    return op;
  }

  /**
   * Générer un rapport d'opérations
   */
  generateReport(startDate, endDate) {
    const ops = this.getOperationsByDateRange(startDate, endDate);
    const stats = this.getFinancialStats('month');

    return {
      period: { start: startDate, end: endDate },
      summary: stats,
      operationsByStatus: {
        pending: ops.filter(o => o.status === 'pending').length,
        approved: ops.filter(o => o.status === 'approved').length,
        validated: ops.filter(o => o.status === 'validated').length,
        completed: ops.filter(o => o.status === 'completed').length,
        rejected: ops.filter(o => o.status === 'rejected').length
      },
      operationsByCategory: this.getExpenseBreakdown(),
      detailedList: ops
    };
  }

  /**
   * Charger les opérations depuis localStorage (à remplacer par Firebase)
   */
  loadOperations() {
    // Données pré-chargées pour la démo
    this.operations = [
      {
        id: 'op_1',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'income',
        amount: 2500000,
        currency: 'XOF',
        category: 'scolarite',
        description: 'Paiement frais de scolarité - Lots janvier 2025',
        reference: 'OP-PAY-001',
        responsible: 'member_3',
        approver: 'member_2',
        validator: 'member_1',
        status: 'completed',
        justifications: [],
        notes: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'member_3',
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        approvalAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completionAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        budgetItem: null,
        costCenter: 'REVENUE'
      },
      {
        id: 'op_2',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'expense',
        amount: 850000,
        currency: 'XOF',
        category: 'materiel',
        description: 'Achat matériel pédagogique - Classe 6ème A',
        reference: 'OP-MAT-001',
        responsible: 'member_3',
        approver: 'member_2',
        validator: 'member_1',
        status: 'completed',
        justifications: [],
        notes: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'member_3',
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        approvalAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completionAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        budgetItem: 'MAT-2025',
        costCenter: 'PEDAGO'
      },
      {
        id: 'op_3',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'expense',
        amount: 15200000,
        currency: 'XOF',
        category: 'salaires',
        description: 'Paiement salaires mensuels - Mai 2025',
        reference: 'OP-SAL-005',
        responsible: 'member_1',
        approver: 'member_2',
        validator: null,
        status: 'approved',
        justifications: [],
        notes: [{ type: 'comment', author: 'member_2', text: 'Approuvé - Conforme au budget', timestamp: new Date().toISOString() }],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'member_1',
        updatedAt: new Date().toISOString(),
        approvalAt: new Date().toISOString(),
        completionAt: null,
        budgetItem: 'SAL-2025',
        costCenter: 'HR'
      }
    ];
  }

  /**
   * Sauvegarder les opérations
   */
  saveOperations() {
    // À intégrer avec Firebase :
    // db.collection('schools').doc(schoolId).collection('operations').setData(this.operations)
    localStorage.setItem(`neoclass_operations_${this.schoolId}`, JSON.stringify(this.operations));
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = FinanceOperationManager;
}
