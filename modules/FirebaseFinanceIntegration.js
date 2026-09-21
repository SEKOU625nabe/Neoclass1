// ============================================================
// NEOCLASS FINANCE – INTÉGRATION FIREBASE COMPLÈTE v2.0
// ============================================================
// Intègre le système financier avec Firestore pour persistance
// ============================================================

class FirebaseFinanceIntegration {
  constructor(schoolId, schoolName = "School") {
    this.schoolId = schoolId;
    this.schoolName = schoolName;
    this.db = null;
    this.initializeFirebase();
  }

  // Initialiser Firebase
  initializeFirebase() {
    try {
      // Vérifier si Firebase est déjà chargé
      if (typeof db !== 'undefined') {
        this.db = db;
        console.log('✅ Firebase Firestore disponible');
      } else {
        console.warn('⚠️ Firebase non disponible, utilisant localStorage');
        this.useLocalStorage = true;
      }
    } catch (error) {
      console.warn('⚠️ Erreur Firebase:', error);
      this.useLocalStorage = true;
    }
  }

  // ============================================================
  // GESTION DES RÔLES ET ÉQUIPE
  // ============================================================

  async saveMember(memberId, memberData) {
    try {
      const data = {
        ...memberData,
        schoolId: this.schoolId,
        updatedAt: new Date(),
        updatedBy: memberData.updatedBy || 'system'
      };

      if (this.db) {
        // Sauvegarder dans Firestore
        await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_team')
          .doc(memberId)
          .set(data, { merge: true });
        
        console.log('✅ Membre sauvegardé dans Firestore:', memberId);
      }

      // Sauvegarder aussi dans localStorage
      this.saveToLocalStorage(`team_${memberId}`, data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur sauvegarde membre:', error);
      return { success: false, error };
    }
  }

  async getTeamMembers() {
    try {
      if (this.db) {
        // Charger depuis Firestore
        const snap = await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_team')
          .get();
        
        const members = [];
        snap.forEach(doc => {
          members.push({ id: doc.id, ...doc.data() });
        });
        return members;
      }

      // Fallback localStorage
      return this.getFromLocalStorage('team_members') || [];
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      return [];
    }
  }

  // ============================================================
  // GESTION DES OPÉRATIONS FINANCIÈRES
  // ============================================================

  async saveOperation(operationId, operationData) {
    try {
      const data = {
        ...operationData,
        schoolId: this.schoolId,
        createdAt: operationData.createdAt || new Date(),
        updatedAt: new Date(),
        recordedBy: operationData.recordedBy || 'system'
      };

      if (this.db) {
        // Sauvegarder dans Firestore
        await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_operations')
          .doc(operationId)
          .set(data, { merge: true });
        
        console.log('✅ Opération sauvegardée:', operationId);
      }

      // Sauvegarder dans localStorage
      this.saveToLocalStorage(`operation_${operationId}`, data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur sauvegarde opération:', error);
      return { success: false, error };
    }
  }

  async getOperations(filters = {}) {
    try {
      if (this.db) {
        // Requête Firestore
        let query = this.db.collection('schools').doc(this.schoolId)
          .collection('finance_operations');

        // Appliquer les filtres
        if (filters.status) {
          query = query.where('status', '==', filters.status);
        }
        if (filters.type) {
          query = query.where('type', '==', filters.type);
        }
        if (filters.category) {
          query = query.where('category', '==', filters.category);
        }

        const snap = await query.orderBy('createdAt', 'desc').get();
        const operations = [];
        snap.forEach(doc => {
          operations.push({ id: doc.id, ...doc.data() });
        });
        return operations;
      }

      // Fallback localStorage
      return this.getFromLocalStorage('operations') || [];
    } catch (error) {
      console.error('❌ Erreur chargement opérations:', error);
      return [];
    }
  }

  async getOperationsByDateRange(startDate, endDate) {
    try {
      if (this.db) {
        const snap = await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_operations')
          .where('createdAt', '>=', new Date(startDate))
          .where('createdAt', '<=', new Date(endDate))
          .orderBy('createdAt', 'desc')
          .get();

        const operations = [];
        snap.forEach(doc => {
          operations.push({ id: doc.id, ...doc.data() });
        });
        return operations;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur requête date:', error);
      return [];
    }
  }

  // ============================================================
  // GESTION DES BUDGETS
  // ============================================================

  async saveBudget(budgetId, budgetData) {
    try {
      const data = {
        ...budgetData,
        schoolId: this.schoolId,
        createdAt: budgetData.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (this.db) {
        await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_budgets')
          .doc(budgetId)
          .set(data, { merge: true });
        
        console.log('✅ Budget sauvegardé:', budgetId);
      }

      this.saveToLocalStorage(`budget_${budgetId}`, data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur sauvegarde budget:', error);
      return { success: false, error };
    }
  }

  async getBudgets(year = null) {
    try {
      if (this.db) {
        let query = this.db.collection('schools').doc(this.schoolId)
          .collection('finance_budgets');

        if (year) {
          query = query.where('year', '==', year);
        }

        const snap = await query.orderBy('updatedAt', 'desc').get();
        const budgets = [];
        snap.forEach(doc => {
          budgets.push({ id: doc.id, ...doc.data() });
        });
        return budgets;
      }

      return this.getFromLocalStorage('budgets') || [];
    } catch (error) {
      console.error('❌ Erreur chargement budgets:', error);
      return [];
    }
  }

  // ============================================================
  // GESTION DES RAPPORTS
  // ============================================================

  async saveReport(reportId, reportData) {
    try {
      const data = {
        ...reportData,
        schoolId: this.schoolId,
        createdAt: new Date(),
        generatedBy: reportData.generatedBy || 'system'
      };

      if (this.db) {
        await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_reports')
          .doc(reportId)
          .set(data, { merge: true });
        
        console.log('✅ Rapport sauvegardé:', reportId);
      }

      this.saveToLocalStorage(`report_${reportId}`, data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur sauvegarde rapport:', error);
      return { success: false, error };
    }
  }

  async getReports(type = null) {
    try {
      if (this.db) {
        let query = this.db.collection('schools').doc(this.schoolId)
          .collection('finance_reports');

        if (type) {
          query = query.where('type', '==', type);
        }

        const snap = await query.orderBy('createdAt', 'desc').get();
        const reports = [];
        snap.forEach(doc => {
          reports.push({ id: doc.id, ...doc.data() });
        });
        return reports;
      }

      return this.getFromLocalStorage('reports') || [];
    } catch (error) {
      console.error('❌ Erreur chargement rapports:', error);
      return [];
    }
  }

  // ============================================================
  // DASHBOARD ET STATISTIQUES
  // ============================================================

  async getFinancialStats(period = 'month') {
    try {
      const operations = await this.getOperations();
      
      const now = new Date();
      let startDate = new Date();

      if (period === 'month') {
        startDate.setMonth(now.getMonth());
        startDate.setDate(1);
      } else if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate.setMonth(quarter * 3);
        startDate.setDate(1);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear());
        startDate.setMonth(0);
        startDate.setDate(1);
      }

      let income = 0;
      let expenses = 0;
      let count = 0;

      operations.forEach(op => {
        const opDate = new Date(op.createdAt);
        if (opDate >= startDate && op.status === 'completed') {
          if (op.type === 'income') income += op.amount;
          else if (op.type === 'expense') expenses += op.amount;
          count++;
        }
      });

      return {
        period,
        income,
        expenses,
        balance: income - expenses,
        operationCount: count,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur statistiques:', error);
      return { income: 0, expenses: 0, balance: 0, operationCount: 0 };
    }
  }

  async getSchoolFinancialDashboard() {
    try {
      const [operations, budgets, teamMembers] = await Promise.all([
        this.getOperations(),
        this.getBudgets(),
        this.getTeamMembers()
      ]);

      const stats = await this.getFinancialStats('month');

      return {
        schoolId: this.schoolId,
        schoolName: this.schoolName,
        stats,
        operations: operations.slice(0, 10), // 10 dernières
        budgets,
        teamSize: teamMembers.length,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur dashboard:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITAIRES LOCALSTORAGE
  // ============================================================

  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(`neoclass_${this.schoolId}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ localStorage indisponible:', error);
    }
  }

  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(`neoclass_${this.schoolId}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('⚠️ Erreur localStorage:', error);
      return null;
    }
  }

  // ============================================================
  // AUDIT ET LOGS
  // ============================================================

  async logAction(action, details) {
    try {
      const logEntry = {
        schoolId: this.schoolId,
        action,
        details,
        timestamp: new Date(),
        user: details.user || 'system'
      };

      if (this.db) {
        await this.db.collection('schools').doc(this.schoolId)
          .collection('finance_logs')
          .add(logEntry);
      }

      this.saveToLocalStorage('audit_log', logEntry);
    } catch (error) {
      console.error('❌ Erreur log:', error);
    }
  }

  // ============================================================
  // SYNCHRONISATION BIDIRECTIONNELLE
  // ============================================================

  async syncWithFirebase() {
    try {
      if (!this.db) {
        console.log('ℹ️ Firebase non disponible, synchronisation ignorée');
        return;
      }

      console.log('🔄 Synchronisation avec Firebase...');

      // Synchroniser les opérations
      const operations = await this.getOperations();
      console.log(`✅ ${operations.length} opérations synchronisées`);

      // Synchroniser les budgets
      const budgets = await this.getBudgets();
      console.log(`✅ ${budgets.length} budgets synchronisés`);

      // Synchroniser l'équipe
      const team = await this.getTeamMembers();
      console.log(`✅ ${team.length} membres synchronisés`);

      return { operations, budgets, team };
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      return null;
    }
  }

  // ============================================================
  // EXPORT DE DONNÉES
  // ============================================================

  async exportAllData() {
    try {
      const data = {
        school: {
          id: this.schoolId,
          name: this.schoolName
        },
        operations: await this.getOperations(),
        budgets: await this.getBudgets(),
        team: await this.getTeamMembers(),
        reports: await this.getReports(),
        exportedAt: new Date()
      };

      return data;
    } catch (error) {
      console.error('❌ Erreur export:', error);
      return null;
    }
  }

  exportToJSON(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neoclass_finance_${this.schoolId}_${new Date().getTime()}.json`;
    link.click();
  }
}

// ============================================================
// EXPORT GLOBAL
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirebaseFinanceIntegration;
}
