import 'package:flutter/material.dart';

// Conditional import based on platform
import 'webview_web.dart' if (dart.library.io) 'webview_mobile.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Yesra Sew',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00A651),
        ), // Ethiopian Green
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}
