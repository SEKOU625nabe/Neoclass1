/**
 * NEOCLASS — Système de Gestion Financière Intégré
 * Point d'entrée central pour la gestion financière complète des écoles
 */

class NeoclassFinanceSystem {
  constructor(schoolId = 'default', schoolName = 'Mon Établissement') {
    this.schoolId = schoolId;
    this.schoolName = schoolName;
    
    // Initialiser tous les modules
    this.roles = new RoleManager();
    this.operations = new FinanceOperationManager(schoolId);
    this.budgets = new BudgetManager(schoolId);
    this.reports = new FinancialReportGenerator(schoolId);
    
    // État global
    this.currentUser = null;
    this.currentYear = new Date().getFullYear();
    
    this.init();
  }

  /**
   * Initialiser le système
   */
  init() {
    console.log(`✅ Système Neoclass Finance initialisé pour ${this.schoolName}`);
    this.logInitialization();
  }

  /**
   * Connexion d'un utilisateur
   */
  login(userId, password) {
    const member = this.roles.members.find(m => m.id === userId);
    
    if (!member || member.status !== 'active') {
      return { success: false, message: 'Utilisateur non trouvé ou inactif' };
    }

    this.currentUser = {
      id: member.id,
      name: member.name,
      role: member.role,
      permissions: member.permissions,
      email: member.email
    };

    member.lastActivity = new Date().toISOString();
    this.roles.saveMembersToDB();

    return { success: true, user: this.currentUser };
  }

  /**
   * Vérifier les permissions de l'utilisateur actuel
   */
  checkPermission(permission) {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * ══ GESTION DES OPÉRATIONS ══
   */

  /**
   * Enregistrer une entrée de fonds
   */
  recordIncome(data) {
    if (!this.checkPermission('record_income')) {
      throw new Error('Permission refusée');
    }

    data.createdBy = this.currentUser.id;
    return this.operations.recordIncome(data);
  }

  /**
   * Enregistrer une dépense
   */
  recordExpense(data) {
    if (!this.checkPermission('execute_spending') && !this.checkPermission('write_entries')) {
      throw new Error('Permission refusée');
    }

    data.createdBy = this.currentUser.id;
    return this.operations.recordExpense(data);
  }

  /**
   * Approuver une opération
   */
  approveOperation(operationId, notes = '') {
    if (!this.checkPermission('approve_spending')) {
      throw new Error('Permission refusée');
    }

    return this.operations.approveOperation(operationId, this.currentUser.id, notes);
  }

  /**
   * Valider une opération
   */
  validateOperation(operationId, notes = '') {
    if (!this.checkPermission('audit_reports')) {
      throw new Error('Permission refusée');
    }

    return this.operations.validateOperation(operationId, this.currentUser.id, notes);
  }

  /**
   * Compléter une opération
   */
  completeOperation(operationId) {
    if (!this.checkPermission('manage_cash')) {
      throw new Error('Permission refusée');
    }

    return this.operations.completeOperation(operationId, this.currentUser.id);
  }

  /**
   * ══ GESTION DES RÔLES ══
   */

  /**
   * Ajouter un nouveau membre à l'équipe
   */
  addTeamMember(data) {
    if (!this.checkPermission('manage_team')) {
      throw new Error('Permission refusée - Vous devez être administrateur');
    }

    const member = this.roles.addMember(data);
    this.logAction(`Nouveau membre ajouté: ${member.name} (${member.role})`);
    return member;
  }

  /**
   * Retirer un membre
   */
  removeTeamMember(memberId) {
    if (!this.checkPermission('manage_team')) {
      throw new Error('Permission refusée');
    }

    this.roles.removeMember(memberId);
    this.logAction(`Membre retiré: ${memberId}`);
  }

  /**
   * Obtenir les membres par rôle
   */
  getTeamByRole(roleId) {
    return this.roles.getMembersByRole(roleId);
  }

  /**
   * Obtenir le rapport d'équipe
   */
  getTeamReport() {
    return this.roles.getTeamReport();
  }

  /**
   * ══ GESTION DES BUDGETS ══
   */

  /**
   * Créer un nouveau budget
   */
  createBudget(data) {
    if (!this.checkPermission('approve_budgets')) {
      throw new Error('Permission refusée - Seul le directeur financier peut créer des budgets');
    }

    data.createdBy = this.currentUser.id;
    data.year = data.year || this.currentYear;
    
    const budget = this.budgets.createBudget(data);
    this.logAction(`Budget créé: ${budget.department} - ${data.totalAllocated}`);
    return budget;
  }

  /**
   * Approuver un budget
   */
  approveBudget(budgetId) {
    if (!this.checkPermission('approve_budgets')) {
      throw new Error('Permission refusée');
    }

    return this.budgets.approveBudget(budgetId, this.currentUser.id);
  }

  /**
   * Exécuter un budget
   */
  executeBudget(budgetId) {
    return this.budgets.executeBudget(budgetId);
  }

  /**
   * Obtenir un rapport budgétaire
   */
  getBudgetReport(year = null) {
    year = year || this.currentYear;
    return this.budgets.generateBudgetReport(year);
  }

  /**
   * ══ RAPPORTS FINANCIERS ══
   */

  /**
   * Générer la synthèse exécutive
   */
  generateExecutiveSummary() {
    return this.reports.generateExecutiveSummary(
      this.operations,
      this.budgets,
      this.currentYear
    );
  }

  /**
   * Générer un compte de résultats
   */
  generateIncomeStatement(startDate, endDate) {
    if (!this.checkPermission('read_all') && !this.checkPermission('audit_reports')) {
      throw new Error('Permission refusée');
    }

    return this.reports.generateIncomeStatement(this.operations, startDate, endDate);
  }

  /**
   * Générer un bilan
   */
  generateBalanceSheet(asOfDate) {
    if (!this.checkPermission('read_all') && !this.checkPermission('audit_reports')) {
      throw new Error('Permission refusée');
    }

    return this.reports.generateBalanceSheet(this.operations, asOfDate);
  }

  /**
   * Générer un état de flux de trésorerie
   */
  generateCashFlowStatement(startDate, endDate) {
    return this.reports.generateCashFlowStatement(this.operations, startDate, endDate);
  }

  /**
   * Générer une analyse budgétaire détaillée
   */
  generateBudgetAnalysis(year = null) {
    year = year || this.currentYear;
    return this.reports.generateDetailedBudgetAnalysis(this.budgets, year);
  }

  /**
   * ══ TABLEAUX DE BORD ══
   */

  /**
   * Obtenir le tableau de bord du directeur financier
   */
  getFinancialDirectorDashboard() {
    return {
      summary: this.generateExecutiveSummary(),
      budgetStatus: this.getBudgetReport(),
      monthlyStats: this.operations.getFinancialStats('month'),
      alerts: this.budgets.getAlertBudgets(),
      teamReport: this.getTeamReport(),
      pendingOperations: this.operations.getOperationsByStatus('pending'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtenir le tableau de bord de l'admin comptable
   */
  getAccountingDashboard() {
    return {
      operationsByStatus: {
        pending: this.operations.getOperationsByStatus('pending'),
        approved: this.operations.getOperationsByStatus('approved'),
        validated: this.operations.getOperationsByStatus('validated'),
        completed: this.operations.getOperationsByStatus('completed')
      },
      monthlyStats: this.operations.getFinancialStats('month'),
      incomeStatement: this.generateIncomeStatement(
        `${this.currentYear}-01-01`,
        new Date().toISOString()
      ),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtenir le tableau de bord du trésorier
   */
  getTreasurerDashboard() {
    return {
      cash: this.calculateCashPosition(),
      completedOperations: this.operations.getOperationsByStatus('completed'),
      validatedOperations: this.operations.getOperationsByStatus('validated'),
      dailyBalance: this.calculateDailyBalance(),
      monthlyStats: this.operations.getFinancialStats('month'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * ══ UTILITAIRES ══
   */

  /**
   * Calculer la position de caisse
   */
  calculateCashPosition() {
    const completedOps = this.operations.getOperationsByStatus('completed');
    return completedOps.reduce((sum, op) => {
      return sum + (op.type === 'income' ? op.amount : -op.amount);
    }, 0);
  }

  /**
   * Calculer le solde journalier
   */
  calculateDailyBalance() {
    const today = new Date().toISOString().split('T')[0];
    const todayOps = this.operations.operations.filter(op => 
      op.date.startsWith(today) && op.status === 'completed'
    );
    
    const income = todayOps
      .filter(op => op.type === 'income')
      .reduce((sum, op) => sum + op.amount, 0);
    
    const expense = todayOps
      .filter(op => op.type === 'expense')
      .reduce((sum, op) => sum + op.amount, 0);

    return { income, expense, balance: income - expense };
  }

  /**
   * Obtenir les statistiques par catégorie
   */
  getExpenseByCategory() {
    return this.operations.getExpenseBreakdown();
  }

  /**
   * Obtenir le rapport de conformité
   */
  getComplianceReport(startDate, endDate) {
    if (!this.checkPermission('audit')) {
      throw new Error('Permission refusée');
    }

    return this.reports.generateComplianceReport(this.operations, startDate, endDate);
  }

  /**
   * Exporter tous les rapports
   */
  exportAllReports(format = 'json') {
    const reports = {
      executive_summary: this.generateExecutiveSummary(),
      income_statement: this.generateIncomeStatement(
        `${this.currentYear}-01-01`,
        new Date().toISOString()
      ),
      balance_sheet: this.generateBalanceSheet(new Date().toISOString()),
      cash_flow: this.generateCashFlowStatement(
        `${this.currentYear}-01-01`,
        new Date().toISOString()
      ),
      budget_analysis: this.generateBudgetAnalysis()
    };

    if (format === 'json') {
      return this.reports.exportToJSON(reports);
    } else if (format === 'pdf') {
      return this.reports.exportToPDF(reports);
    }

    return reports;
  }

  /**
   * Journal des activités
   */
  logAction(message) {
    const log = {
      timestamp: new Date().toISOString(),
      userId: this.currentUser?.id || 'system',
      userName: this.currentUser?.name || 'Système',
      action: message,
      schoolId: this.schoolId
    };

    console.log(`[${log.timestamp}] ${log.userName}: ${message}`);
    
    // À intégrer avec une base de données
    this.saveLog(log);
  }

  /**
   * Sauvegarder les logs
   */
  saveLog(log) {
    const logs = JSON.parse(localStorage.getItem(`neoclass_logs_${this.schoolId}`) || '[]');
    logs.push(log);
    localStorage.setItem(`neoclass_logs_${this.schoolId}`, JSON.stringify(logs));
  }

  /**
   * Initialiser le log du système
   */
  logInitialization() {
    this.logAction(`Système Finance initialisé - ${this.schoolName}`);
    console.log('📊 Modules chargés:');
    console.log('  ✓ Gestion des rôles');
    console.log('  ✓ Opérations financières');
    console.log('  ✓ Gestion budgétaire');
    console.log('  ✓ Génération de rapports');
  }

  /**
   * Obtenir un résumé du système
   */
  getSystemStatus() {
    return {
      school: this.schoolName,
      schoolId: this.schoolId,
      currentYear: this.currentYear,
      currentUser: this.currentUser?.name || 'Non connecté',
      totalMembers: this.roles.members.filter(m => m.status === 'active').length,
      totalOperations: this.operations.operations.length,
      totalBudgets: this.budgets.budgets.length,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export pour utilisation dans les modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeoclassFinanceSystem;
}
