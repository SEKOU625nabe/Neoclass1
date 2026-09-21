import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_fonts/google_fonts.dart';

// ============================================================
// 💳 PRICING SCREEN - Flutter
// ============================================================

class PricingScreen extends StatefulWidget {
  const PricingScreen({Key? key}) : super(key: key);

  @override
  State<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends State<PricingScreen> {
  String selectedUserType = 'student';
  Map<String, dynamic> pricingData = {};
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPricing();
  }

  Future<void> _loadPricing() async {
    try {
      final doc = await FirebaseFirestore.instance
          .collection('settings')
          .doc('pricing')
          .get();

      if (doc.exists) {
        setState(() {
          pricingData = doc.data() ?? {};
          isLoading = false;
        });
      } else {
        setState(() {
          pricingData = _getDefaultPricing();
          isLoading = false;
        });
      }
    } catch (e) {
      print('❌ Erreur chargement pricing: $e');
      setState(() {
        pricingData = _getDefaultPricing();
        isLoading = false;
      });
    }
  }

  Map<String, dynamic> _getDefaultPricing() {
    return {
      'prices': {
        'student': {
          'monthly': {'price': 20000},
          'quarterly': {'price': 50000},
          'annual': {'price': 200000},
        },
        'school': {
          'monthly': {'price': 500000},
          'quarterly': {'price': 1400000},
          'annual': {'price': 5000000},
        },
        'parent': {
          'monthly': {'price': 15000},
          'quarterly': {'price': 40000},
          'annual': {'price': 160000},
        },
      },
    };
  }

  Future<void> _selectPlan(String planType, int price) async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        _showSnackBar('❌ Veuillez vous connecter d\'abord');
        return;
      }

      await FirebaseFirestore.instance.collection('subscriptions').add({
        'userId': user.uid,
        'userType': selectedUserType,
        'planType': planType,
        'price': price,
        'status': 'trial',
        'trialEndsAt': DateTime.now().add(Duration(days: 30)),
        'createdAt': DateTime.now(),
        'platform': 'flutter',
      });

      _showSnackBar('✅ Abonnement créé!');
      Navigator.of(context).pushReplacementNamed('/dashboard');
    } catch (e) {
      _showSnackBar('❌ Erreur: ${e.toString()}');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '💳 Choisissez votre Plan',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  // Trial Banner
                  Container(
                    margin: const EdgeInsets.all(15),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.amber[100]!, Colors.orange[200]!],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          '🎁 Premier mois GRATUIT',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF78350F),
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Essayez Neoclass sans engagement. À partir du 2e mois, commencez à payer.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF92400E),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // User Type Selector
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildUserTypeButton('student', '👨‍🎓 Élèves'),
                        _buildUserTypeButton('school', '🏫 Écoles'),
                        _buildUserTypeButton('parent', '👨‍👩‍👧 Parents'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Pricing Cards
                  Padding(
                    padding: const EdgeInsets.all(15),
                    child: Column(
                      children: _buildPricingCards(),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildUserTypeButton(String type, String label) {
    final isSelected = selectedUserType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedUserType = type;
        });
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : Colors.grey[700],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildPricingCards() {
    final prices =
        pricingData['prices']?[selectedUserType] ?? _getDefaultPricing()['prices']![selectedUserType];

    final plans = [
      {'key': 'monthly', 'icon': '📅', 'label': 'Mensuel', 'desc': 'Parfait pour tester'},
      {'key': 'quarterly', 'icon': '📆', 'label': 'Trimestriel', 'desc': 'Meilleure valeur', 'popular': true},
      {'key': 'annual', 'icon': '🎁', 'label': 'Annuel', 'desc': 'Économies maximales'},
    ];

    return plans.map((plan) {
      final planKey = plan['key'] as String;
      final planData = prices[planKey] ?? {};
      final price = planData['price'] ?? 0;
      final isPopular = plan['popular'] == true;

      return Container(
        margin: const EdgeInsets.only(bottom: 15),
        decoration: BoxDecoration(
          border: Border.all(
            color: isPopular ? Colors.blue : Colors.grey[300]!,
            width: isPopular ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          children: [
            if (isPopular)
              Positioned(
                top: -1,
                left: 50,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    '⭐ POPULAIRE',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isPopular) const SizedBox(height: 15),
                  // Header
                  Row(
                    children: [
                      Text(
                        plan['icon'] as String,
                        style: const TextStyle(fontSize: 28),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            plan['label'] as String,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            plan['desc'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 15),

                  // Price
                  RichText(
                    text: TextSpan(
                      children: [
                        const TextSpan(
                          text: '₣',
                          style: TextStyle(
                            fontSize: 20,
                            color: Colors.blue,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        TextSpan(
                          text: price.toString().replaceAllMapped(
                            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                            (match) => '${match[1]} ',
                          ),
                          style: const TextStyle(
                            fontSize: 28,
                            color: Colors.blue,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  Text(
                    planKey == 'monthly'
                        ? 'par mois'
                        : planKey == 'quarterly'
                            ? 'par trimestre'
                            : 'par an',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
                  ),

                  const SizedBox(height: 15),

                  // Trial info
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amber[200]!),
                    ),
                    child: Text(
                      '🎁 Premier mois gratuit\nPuis ₣${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (match) => '${match[1]} ')} ${planKey == 'monthly' ? 'par mois' : planKey == 'quarterly' ? 'par trimestre' : 'par an'}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF92400E),
                      ),
                    ),
                  ),

                  const SizedBox(height: 15),

                  // Features
                  const Feature(icon: '✅', text: 'Accès complet aux cours'),
                  const Feature(icon: '✅', text: 'DARX IA activé'),
                  const Feature(icon: '✅', text: 'Gamification complète'),
                  const Feature(icon: '✅', text: 'Certificats validés'),
                  const Feature(icon: '✅', text: 'Support prioritaire'),
                  if (planKey != 'monthly') const Feature(icon: '✅', text: 'Accès hors ligne'),
                  if (planKey == 'annual') const Feature(icon: '✅', text: 'Contenu premium'),

                  const SizedBox(height: 15),

                  // Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _selectPlan(planKey, price),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Commencer - Premier mois gratuit',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }).toList();
  }
}

// ============================================================
// FEATURE WIDGET
// ============================================================

class Feature extends StatelessWidget {
  final String icon;
  final String text;

  const Feature({
    Key? key,
    required this.icon,
    required this.text,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 10),
          Text(
            text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// SUBSCRIPTION MANAGER - Gestion des abonnements
// ============================================================

class SubscriptionManager {
  static final _instance = SubscriptionManager._internal();

  factory SubscriptionManager() {
    return _instance;
  }

  SubscriptionManager._internal();

  Future<Map<String, dynamic>?> getUserSubscription(String userId) async {
    try {
      final querySnapshot = await FirebaseFirestore.instance
          .collection('subscriptions')
          .where('userId', isEqualTo: userId)
          .where('status', isEqualTo: 'active')
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        return querySnapshot.docs.first.data();
      }
      return null;
    } catch (e) {
      print('❌ Erreur: $e');
      return null;
    }
  }

  Future<bool> isInTrial(String userId) async {
    try {
      final sub = await getUserSubscription(userId);
      if (sub == null) return false;

      final trialEndsAt = (sub['trialEndsAt'] as Timestamp).toDate();
      return DateTime.now().isBefore(trialEndsAt);
    } catch (e) {
      return false;
    }
  }

  Future<int> getTrialDaysRemaining(String userId) async {
    try {
      final sub = await getUserSubscription(userId);
      if (sub == null) return 0;

      final trialEndsAt = (sub['trialEndsAt'] as Timestamp).toDate();
      final diff = trialEndsAt.difference(DateTime.now()).inDays;
      return diff > 0 ? diff : 0;
    } catch (e) {
      return 0;
    }
  }

  Future<bool> hasActivePaidSubscription(String userId) async {
    try {
      final sub = await getUserSubscription(userId);
      if (sub == null) return false;

      final status = sub['status'] as String;
      final isPaid = sub['isPaid'] as bool? ?? false;

      return status == 'active' && isPaid;
    } catch (e) {
      return false;
    }
  }

  Future<void> cancelSubscription(String userId) async {
    try {
      final querySnapshot = await FirebaseFirestore.instance
          .collection('subscriptions')
          .where('userId', isEqualTo: userId)
          .get();

      for (final doc in querySnapshot.docs) {
        await doc.reference.update({'status': 'cancelled'});
      }
    } catch (e) {
      print('❌ Erreur annulation: $e');
    }
  }

  Future<void> upgradeSubscription(
    String userId,
    String newPlanType,
    int newPrice,
  ) async {
    try {
      final querySnapshot = await FirebaseFirestore.instance
          .collection('subscriptions')
          .where('userId', isEqualTo: userId)
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        await querySnapshot.docs.first.reference.update({
          'planType': newPlanType,
          'price': newPrice,
          'upgradedAt': DateTime.now(),
        });
      }
    } catch (e) {
      print('❌ Erreur upgrade: $e');
    }
  }
}
