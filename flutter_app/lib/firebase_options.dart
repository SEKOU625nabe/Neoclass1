import 'package:firebase_core/firebase_core.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    return web;
  }

  // Web Configuration
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDkLJFpQw_neoclass_YOUR_API_KEY',
    appId: '1:123456789012:web:abc123def456ghi789jkl',
    messagingSenderId: '123456789012',
    projectId: 'neoclass-73b86',
    authDomain: 'neoclass-73b86.firebaseapp.com',
    storageBucket: 'neoclass-73b86.appspot.com',
    measurementId: 'G-ABCDEFGHIJ',
  );

  // Android Configuration (si applicable)
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'YOUR_ANDROID_API_KEY',
    appId: '1:123456789012:android:abc123def456ghi',
    messagingSenderId: '123456789012',
    projectId: 'neoclass-73b86',
    storageBucket: 'neoclass-73b86.appspot.com',
  );

  // iOS Configuration (si applicable)
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'YOUR_iOS_API_KEY',
    appId: '1:123456789012:ios:abc123def456ghi',
    messagingSenderId: '123456789012',
    projectId: 'neoclass-73b86',
    storageBucket: 'neoclass-73b86.appspot.com',
    iosBundleId: 'com.neoclass.mobile',
  );
}
