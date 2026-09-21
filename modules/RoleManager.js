/**
 * NEOCLASS — Système de Gestion des Rôles Financiers
 * Module de gestion des administrateurs comptables, directeurs, admin généraux
 */

class RoleManager {
  constructor() {
    this.roles = [
      {
        id: 'comptable',
        name: 'Admin Comptable',
        icon: '📊',
        description: 'Gère les écritures comptables, les pièces justificatives et les rapports financiers détaillés.',
        permissions: ['write_entries', 'manage_documents', 'audit_reports', 'access_compliance'],
        color: '#2563EB'
      },
      {
        id: 'directeur_finances',
        name: 'Directeur Finances',
        icon: '💼',
        description: 'Supervise la stratégie financière, approuve les budgets et contrôle les dépenses majeures.',
        permissions: ['approve_budgets', 'approve_spending', 'strategic_planning', 'treasury_control', 'see_all'],
        color: '#C8A84B'
      },
      {
        id: 'admin_general',
        name: 'Admin Général',
        icon: '⚙️',
        description: 'Gère les dépenses opérationnelles, les contrats et les ressources. Exécutif sur budget approuvé.',
        permissions: ['execute_spending', 'manage_contracts', 'hr_operations', 'supplier_management'],
        color: '#059669'
      },
      {
        id: 'tresorier',
        name: 'Trésorier',
        icon: '💳',
        description: 'Gère la caisse, les paiements, les encaissements et les flux de trésorerie. Rapports quotidiens.',
        permissions: ['manage_cash', 'process_payments', 'record_receipts', 'daily_reports'],
        color: '#7C3AED'
      },
      {
        id: 'verificateur',
        name: 'Vérificateur Comptes',
        icon: '🔍',
        description: 'Effectue les audits internes, vérifie la conformité et valide les rapports financiers.',
        permissions: ['audit', 'read_all', 'report_audit', 'trace_logs'],
        color: '#0F766E'
      },
      {
        id: 'coordinateur_ecoles',
        name: 'Coordinateur Écoles',
        icon: '🏫',
        description: 'Supervise la gestion financière des succursales, agrège les données au niveau national.',
        permissions: ['see_branches', 'consolidate_reports', 'branch_audit', 'approval_branch'],
        color: '#DC2626'
      }
    ];

    this.members = [];
    this.loadMembers();
  }

  /**
   * Ajouter un nouveau membre
   */
  addMember(data) {
    const member = {
      id: `member_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: 'active',
      joinDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      permissions: this.getRolePermissions(data.role),
      avatar: this.generateAvatar(data.name)
    };

    this.members.push(member);
    this.saveMembersToDB();
    return member;
  }

  /**
   * Obtenir les permissions d'un rôle
   */
  getRolePermissions(roleId) {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.permissions : [];
  }

  /**
   * Obtenir tous les membres d'un rôle spécifique
   */
  getMembersByRole(roleId) {
    return this.members.filter(m => m.role === roleId && m.status === 'active');
  }

  /**
   * Mettre à jour un membre
   */
  updateMember(memberId, data) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return null;

    Object.assign(member, data);
    member.lastActivity = new Date().toISOString();
    this.saveMembersToDB();
    return member;
  }

  /**
   * Retirer un membre
   */
  removeMember(memberId) {
    const index = this.members.findIndex(m => m.id === memberId);
    if (index === -1) return false;

    this.members[index].status = 'inactive';
    this.saveMembersToDB();
    return true;
  }

  /**
   * Vérifié si un utilisateur peut effectuer une action
   */
  hasPermission(memberId, permissionName) {
    const member = this.members.find(m => m.id === memberId);
    return member ? member.permissions.includes(permissionName) : false;
  }

  /**
   * Générer les initiales pour l'avatar
   */
  generateAvatar(name) {
    const parts = name.split(' ');
    const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    return initials;
  }

  /**
   * Charger les données depuis le stockage local (à remplacer par une BD réelle)
   */
  loadMembers() {
    // Données pré-chargées pour la démo
    this.members = [
      {
        id: 'member_1',
        name: 'Marie Angélique Camara',
        email: 'marie.camara@neoclass.edu',
        phone: '+224 622 123 456',
        role: 'comptable',
        status: 'active',
        joinDate: '2025-01-15T00:00:00Z',
        lastActivity: new Date().toISOString(),
        permissions: this.getRolePermissions('comptable'),
        avatar: 'MA'
      },
      {
        id: 'member_2',
        name: 'Pierre Diallo',
        email: 'pierre.diallo@neoclass.edu',
        phone: '+224 623 456 789',
        role: 'directeur_finances',
        status: 'active',
        joinDate: '2024-08-20T00:00:00Z',
        lastActivity: new Date().toISOString(),
        permissions: this.getRolePermissions('directeur_finances'),
        avatar: 'PD'
      },
      {
        id: 'member_3',
        name: 'Fatima Sow',
        email: 'fatima.sow@neoclass.edu',
        phone: '+224 624 789 012',
        role: 'admin_general',
        status: 'active',
        joinDate: '2024-09-10T00:00:00Z',
        lastActivity: new Date().toISOString(),
        permissions: this.getRolePermissions('admin_general'),
        avatar: 'FS'
      },
      {
        id: 'member_4',
        name: 'Amadou Kone',
        email: 'amadou.kone@neoclass.edu',
        phone: '+224 625 345 678',
        role: 'tresorier',
        status: 'active',
        joinDate: '2024-11-05T00:00:00Z',
        lastActivity: new Date().toISOString(),
        permissions: this.getRolePermissions('tresorier'),
        avatar: 'AK'
      },
      {
        id: 'member_5',
        name: 'Binta Rousseau',
        email: 'binta.rousseau@neoclass.edu',
        phone: '+224 626 901 234',
        role: 'verificateur',
        status: 'active',
        joinDate: '2025-01-10T00:00:00Z',
        lastActivity: new Date().toISOString(),
        permissions: this.getRolePermissions('verificateur'),
        avatar: 'BR'
      },
      {
        id: 'member_6',
        name: 'Sekou Diallo',
        email: 'sekou.diallo@neoclass.edu',
        phone: '+224 627 567 890',
        role: 'coordinateur_ecoles',
        status: 'active',
        joinDate: '2024-12-01T00:00:00Z',
        lastActivity: new Date().toISOString(),
        permissions: this.getRolePermissions('coordinateur_ecoles'),
        avatar: 'SD'
      }
    ];
  }

  /**
   * Sauvegarder en base de données (Firebase Firestore)
   */
  saveMembersToDB() {
    // À intégrer avec Firebase :
    // db.collection('schools').doc(schoolId).collection('members').setData(this.members)
    // Pour la démo, on utilise localStorage
    localStorage.setItem('neoclass_members', JSON.stringify(this.members));
  }

  /**
   * Obtenir un rapport de l'équipe
   */
  getTeamReport() {
    const byRole = {};
    this.roles.forEach(role => {
      byRole[role.id] = this.getMembersByRole(role.id).length;
    });

    return {
      totalMembers: this.members.filter(m => m.status === 'active').length,
      totalRoles: this.roles.length,
      membersByRole: byRole,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Générer un token d'invitation
   */
  generateInvitationToken(roleId, email) {
    return {
      token: `neoclass_inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roleId: roleId,
      email: email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      status: 'pending'
    };
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = RoleManager;
}
