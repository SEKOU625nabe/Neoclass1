/**
 * NEOCLASS — Système de Génération de Rapports Financiers
 * Module pour générer bilans, comptes de résultats, analyses budgétaires
 */

class FinancialReportGenerator {
  constructor(schoolId = 'default') {
    this.schoolId = schoolId;
  }

  /**
   * Générer un rapport de synthèse (Executive Summary)
   */
  generateExecutiveSummary(financeManager, budgetManager, year) {
    const monthStats = financeManager.getFinancialStats('month');
    const yearStats = this.getAnnualStats(financeManager, year);
    const budgetReport = budgetManager.generateBudgetReport(year);

    return {
      title: `Synthèse Financière - ${year}`,
      generatedAt: new Date().toISOString(),
      
      cashFlow: {
        monthlyIncome: monthStats.totalIncome,
        monthlyExpenses: monthStats.totalExpenses,
        monthlyBalance: monthStats.balance,
        trend: monthStats.balance > 0 ? 'positive' : 'negative'
      },

      budget: {
        totalAllocated: budgetReport.summary.totalAllocated,
        totalSpent: budgetReport.summary.totalSpent,
        utilizationRate: budgetReport.summary.utilizationRate,
        status: budgetReport.summary.utilizationRate > 100 ? 'overbudget' : 'normal'
      },

      alerts: this.generateAlerts(financeManager, budgetManager),
      
      keyMetrics: {
        operationalRatio: monthStats.totalExpenses > 0 
          ? Math.round((monthStats.totalExpenses / monthStats.totalIncome) * 100)
          : 0,
        healthIndicator: this.calculateHealthIndicator(monthStats, budgetReport),
        recommendations: this.generateRecommendations(monthStats, budgetReport)
      }
    };
  }

  /**
   * Générer un Compte de Résultats
   */
  generateIncomeStatement(financeManager, startDate, endDate) {
    const ops = financeManager.getOperationsByDateRange(startDate, endDate);
    
    // Catégoriser les revenus et dépenses
    const revenues = {};
    const expenses = {};

    ops.forEach(op => {
      if (op.type === 'income' && op.status === 'completed') {
        revenues[op.category] = (revenues[op.category] || 0) + op.amount;
      } else if (op.type === 'expense' && op.status === 'completed') {
        expenses[op.category] = (expenses[op.category] || 0) + op.amount;
      }
    });

    const totalRevenues = Object.values(revenues).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    const netResult = totalRevenues - totalExpenses;

    return {
      title: 'Compte de Résultats',
      period: { start: startDate, end: endDate },
      generatedAt: new Date().toISOString(),

      revenues: revenues,
      totalRevenues: totalRevenues,

      expenses: expenses,
      totalExpenses: totalExpenses,

      netResult: netResult,
      margin: totalRevenues > 0 ? Math.round((netResult / totalRevenues) * 100) : 0,

      ratios: {
        expenseRatio: Math.round((totalExpenses / totalRevenues) * 100),
        profitMargin: Math.round((netResult / totalRevenues) * 100)
      }
    };
  }

  /**
   * Générer un Bilan (Balance Sheet)
   */
  generateBalanceSheet(financeManager, asOfDate) {
    const ops = financeManager.getOperationsByDateRange('2025-01-01', asOfDate);
    
    // Actif
    const assets = {
      cash: this.calculateCashPosition(ops),
      receivables: this.calculateReceivables(ops),
      inventory: 0 // À intégrer si nécessaire
    };

    // Passif
    const liabilities = {
      payables: this.calculatePayables(ops),
      commitments: 0 // À définir
    };

    // Capitaux propres
    const equity = {
      retained_earnings: assets.cash - liabilities.payables,
      current_year_result: this.calculateYearResult(ops)
    };

    const totalAssets = Object.values(assets).reduce((sum, val) => sum + val, 0);
    const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + val, 0);
    const totalEquity = Object.values(equity).reduce((sum, val) => sum + val, 0);

    return {
      title: 'Bilan Financier',
      asOfDate: asOfDate,
      generatedAt: new Date().toISOString(),

      assets: assets,
      totalAssets: totalAssets,

      liabilities: liabilities,
      totalLiabilities: totalLiabilities,

      equity: equity,
      totalEquity: totalEquity,

      balancingCheck: totalAssets === (totalLiabilities + totalEquity),

      ratios: {
        solvencyRatio: totalLiabilities > 0 ? Math.round(totalAssets / totalLiabilities) : 1,
        equityRatio: totalAssets > 0 ? Math.round((totalEquity / totalAssets) * 100) : 0
      }
    };
  }

  /**
   * Générer un rapport d'analyse budgétaire détaillée
   */
  generateDetailedBudgetAnalysis(budgetManager, year) {
    const budgets = budgetManager.getBudgetsByYear(year);
    const analysis = budgetManager.analyzeByDepartment(year);

    const details = {};
    budgets.forEach(budget => {
      const dept = budget.department;
      if (!details[dept]) {
        details[dept] = [];
      }
      details[dept].push({
        allocatedAmount: budget.totalAllocated,
        spentAmount: budget.spent,
        committedAmount: budget.committed,
        remainingAmount: budget.remaining,
        utilizationRate: budget.utilizationRate,
        status: budgetManager.getBudgetStatus(budget),
        items: budget.items
      });
    });

    return {
      title: `Analyse Budgétaire Détaillée - ${year}`,
      year: year,
      generatedAt: new Date().toISOString(),

      overview: analysis,
      departmentDetails: details,

      variances: this.calculateBudgetVariances(budgets),
      trends: this.analyzeBudgetTrends(budgets)
    };
  }

  /**
   * Générer un rapport de trésorerie (Cash Flow Statement)
   */
  generateCashFlowStatement(financeManager, startDate, endDate) {
    const ops = financeManager.getOperationsByDateRange(startDate, endDate);

    const inflows = ops
      .filter(o => o.type === 'income' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    const outflows = ops
      .filter(o => o.type === 'expense' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    const netCashFlow = inflows - outflows;

    return {
      title: 'État des Flux de Trésorerie',
      period: { start: startDate, end: endDate },
      generatedAt: new Date().toISOString(),

      operatingActivities: {
        inflows: inflows,
        outflows: outflows,
        netFlow: netCashFlow
      },

      cashPositionChange: netCashFlow,
      status: netCashFlow > 0 ? 'positive' : 'negative'
    };
  }

  /**
   * Générer un rapport de conformité
   */
  generateComplianceReport(operationManager, startDate, endDate) {
    const ops = operationManager.getOperationsByDateRange(startDate, endDate);

    const completedOps = ops.filter(o => o.status === 'completed').length;
    const approvedOps = ops.filter(o => o.status === 'approved').length;
    const rejectedOps = ops.filter(o => o.status === 'rejected').length;
    const pendingOps = ops.filter(o => o.status === 'pending').length;

    const compliance = {
      totalOperations: ops.length,
      completedOperations: completedOps,
      approvalRate: ops.length > 0 ? Math.round(((completedOps + approvedOps) / ops.length) * 100) : 0,
      rejectionRate: ops.length > 0 ? Math.round((rejectedOps / ops.length) * 100) : 0,
      pendingOperations: pendingOps
    };

    return {
      title: 'Rapport de Conformité',
      period: { start: startDate, end: endDate },
      generatedAt: new Date().toISOString(),

      compliance: compliance,
      status: compliance.approvalRate >= 95 ? 'compliant' : 'review_needed',
      recommendations: this.generateComplianceRecommendations(compliance)
    };
  }

  /**
   * Calculer les statistiques annuelles
   */
  getAnnualStats(financeManager, year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const ops = financeManager.getOperationsByDateRange(startDate, endDate);

    const income = ops
      .filter(o => o.type === 'income' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    const expenses = ops
      .filter(o => o.type === 'expense' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      year: year,
      totalIncome: income,
      totalExpenses: expenses,
      netResult: income - expenses
    };
  }

  /**
   * Générer des alertes
   */
  generateAlerts(financeManager, budgetManager) {
    const alerts = [];
    const alertBudgets = budgetManager.getAlertBudgets();

    if (alertBudgets.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${alertBudgets.length} budget(s) approche(nt) de la limite (>80% utilisé)`,
        severity: 'high'
      });
    }

    return alerts;
  }

  /**
   * Calculer l'indicateur de santé financière
   */
  calculateHealthIndicator(monthStats, budgetReport) {
    const score = 100
      + (monthStats.balance > 0 ? 10 : -10)
      + (budgetReport.summary.utilizationRate < 85 ? 20 : -20)
      + (monthStats.totalIncome > 0 ? 5 : 0);

    if (score >= 100) return 'Excellent';
    if (score >= 80) return 'Bon';
    if (score >= 60) return 'Satisfaisant';
    return 'À améliorer';
  }

  /**
   * Générer des recommandations
   */
  generateRecommendations(monthStats, budgetReport) {
    const recommendations = [];

    if (monthStats.balance < 0) {
      recommendations.push('⚠️ Réduire les dépenses ou augmenter les revenus');
    }

    if (budgetReport.summary.utilizationRate > 85) {
      recommendations.push('📊 Réviser les allocations budgétaires');
    }

    if (monthStats.pendingAmount > 0) {
      recommendations.push('⏳ Valider les opérations en attente');
    }

    return recommendations;
  }

  /**
   * Calculer la position de caisse
   */
  calculateCashPosition(ops) {
    return ops
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.type === 'income' ? o.amount : -o.amount), 0);
  }

  /**
   * Calculer les créances
   */
  calculateReceivables(ops) {
    return ops
      .filter(o => o.type === 'income' && o.status !== 'completed')
      .reduce((sum, o) => sum + o.amount, 0);
  }

  /**
   * Calculer les dettes
   */
  calculatePayables(ops) {
    return ops
      .filter(o => o.type === 'expense' && o.status !== 'completed')
      .reduce((sum, o) => sum + o.amount, 0);
  }

  /**
   * Calculer le résultat de l'année
   */
  calculateYearResult(ops) {
    const income = ops
      .filter(o => o.type === 'income' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    const expenses = ops
      .filter(o => o.type === 'expense' && o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0);

    return income - expenses;
  }

  /**
   * Calculer les variances budgétaires
   */
  calculateBudgetVariances(budgets) {
    const variances = {};
    budgets.forEach(budget => {
      const variance = budget.totalAllocated - budget.spent;
      const variancePercent = (variance / budget.totalAllocated) * 100;
      variances[budget.id] = {
        amount: variance,
        percentage: variancePercent,
        status: variance > 0 ? 'favorable' : 'unfavorable'
      };
    });
    return variances;
  }

  /**
   * Analyser les tendances budgétaires
   */
  analyzeBudgetTrends(budgets) {
    const byDept = {};
    budgets.forEach(budget => {
      if (!byDept[budget.department]) {
        byDept[budget.department] = { count: 0, totalSpent: 0, totalAllocated: 0 };
      }
      byDept[budget.department].count++;
      byDept[budget.department].totalSpent += budget.spent;
      byDept[budget.department].totalAllocated += budget.totalAllocated;
    });

    const trends = {};
    Object.entries(byDept).forEach(([dept, data]) => {
      trends[dept] = {
        averageUtilization: Math.round((data.totalSpent / data.totalAllocated) * 100)
      };
    });

    return trends;
  }

  /**
   * Générer des recommandations de conformité
   */
  generateComplianceRecommendations(compliance) {
    const recommendations = [];

    if (compliance.approvalRate < 95) {
      recommendations.push('Améliorer le processus d\'approbation des opérations');
    }

    if (compliance.rejectionRate > 5) {
      recommendations.push('Analyser les raisons des rejets');
    }

    if (compliance.pendingOperations > 10) {
      recommendations.push('Accélérer la validation des opérations en attente');
    }

    return recommendations;
  }

  /**
   * Exporter un rapport au format JSON
   */
  exportToJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Générer un PDF (nécessite une bibliothèque comme jsPDF)
   */
  exportToPDF(report) {
    // À implémenter avec jsPDF
    console.log('Export PDF - Nécessite jsPDF ou similaire');
    return null;
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = FinancialReportGenerator;
}
