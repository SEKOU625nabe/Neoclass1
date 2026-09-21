import 'package:flutter/material.dart';

class LearningScreen extends StatelessWidget {
  const LearningScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('📚 Apprentissage'),
        backgroundColor: Color(0xFF6c63ff),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Bienvenue dans la section Apprentissage!'),
            SizedBox(height: 24),
            Text('📚 Mes Cours\n✅ Quizzes\n📺 Cours Live\n📚 Bibliothèque'),
          ],
        ),
      ),
    );
  }
}

class AIScreen extends StatelessWidget {
  const AIScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('🤖 DARX IA'),
        backgroundColor: Color(0xFF6c63ff),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Bienvenue dans DARX IA!'),
            SizedBox(height: 24),
            Text('📸 Aide Devoirs\n🧠 Plan d\'Étude\n📝 Fiches Révision\n🃏 Flashcards'),
          ],
        ),
      ),
    );
  }
}

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('🏆 Récompenses'),
        backgroundColor: Color(0xFF6c63ff),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Bienvenue dans Récompenses!'),
            SizedBox(height: 24),
            Text('🏆 Classement\n💰 NabeCoins\n🛒 Boutique\n🏅 Certificats'),
          ],
        ),
      ),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('👤 Profil'),
        backgroundColor: Color(0xFF6c63ff),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Bienvenue dans votre Profil!'),
            SizedBox(height: 24),
            Text('👤 Mon Profil\n⚙️ Paramètres\n🔒 Sécurité\n🌙 Thème'),
          ],
        ),
      ),
    );
  }
}
