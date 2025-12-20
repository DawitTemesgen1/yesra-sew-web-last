import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'webview_web.dart' if (dart.library.io) 'webview_mobile.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _pulseController;

  // Animation Values
  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _textOpacity;
  late Animation<double> _lineProgress;

  // Preloading
  late WebViewController _preloadedController;
  final Completer<void> _pageLoadCompleter = Completer<void>();

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _initializeBackgroundWebView();

    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    // 1. Logo Fade In & Scale Up
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.0, 0.3, curve: Curves.easeIn),
      ),
    );
    _logoScale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.0, 0.4, curve: Curves.easeOutBack),
      ),
    );

    // 2. Text Fade In
    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.3, 0.6, curve: Curves.easeIn),
      ),
    );

    // 3. Line/Progress Bar growth
    _lineProgress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.5, 0.9, curve: Curves.easeInOutCubic),
      ),
    );

    _mainController.forward();

    // Navigation Logic
    bool hasNavigated = false;
    Timer(const Duration(milliseconds: 4500), () {
      _pageLoadCompleter.future.then((_) {
        if (!hasNavigated) {
          hasNavigated = true;
          _navigateToNextScreen();
        }
      });

      // Safety timeout after 5.5 seconds total if page is slow
      Future.delayed(const Duration(seconds: 1), () {
        if (!hasNavigated) {
          hasNavigated = true;
          _navigateToNextScreen();
        }
      });
    });
  }

  void _initializeBackgroundWebView() {
    _preloadedController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white) // Match website background
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            // Signal that high-priority loading is done
            if (!_pageLoadCompleter.isCompleted) _pageLoadCompleter.complete();
          },
          onWebResourceError: (_) {
            if (!_pageLoadCompleter.isCompleted) _pageLoadCompleter.complete();
          },
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://www.yesrasewsolution.com'));
  }

  void _navigateToNextScreen() {
    if (!mounted) return;
    SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.manual,
      overlays: SystemUiOverlay.values,
    );

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) =>
            WebViewScreen(controller: _preloadedController),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  @override
  void dispose() {
    _mainController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050505), // Nearly Black
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Background Grid / Tech Effect
          CustomPaint(
            painter: TechGridPainter(animationValue: _pulseController.value),
          ),

          // 2. Center Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Glowing Logo
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(
                              0xFF00A651,
                            ).withOpacity(0.3 + (_pulseController.value * 0.2)),
                            blurRadius: 60,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                      child: child,
                    );
                  },
                  child: ScaleTransition(
                    scale: _logoScale,
                    child: FadeTransition(
                      opacity: _logoOpacity,
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.black, // Logo sits on black
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF00A651).withOpacity(0.5),
                            width: 2,
                          ),
                        ),
                        child: Image.asset(
                          'assets/logo.png',
                          width: 100,
                          height: 100,
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 50),

                // Typography
                FadeTransition(
                  opacity: _textOpacity,
                  child: Column(
                    children: [
                      const Text(
                        "YESRA SEW",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2.0,
                          fontFamily: 'Roboto',
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 30,
                            height: 1,
                            color: const Color(0xFF00A651),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 10),
                            child: Text(
                              "SOLUTION",
                              style: TextStyle(
                                color: Color(0xFF00A651),
                                fontSize: 16,
                                letterSpacing: 6.0,
                              ),
                            ),
                          ),
                          Container(
                            width: 30,
                            height: 1,
                            color: const Color(0xFF00A651),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      // Motto
                      const Text(
                        "Your Number One Digital Marketplace",
                        style: TextStyle(
                          color: Colors.white54,
                          fontSize: 12,
                          letterSpacing: 1.0,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 60),

                // Animated Progress Bar
                AnimatedBuilder(
                  animation: _lineProgress,
                  builder: (context, child) {
                    return Container(
                      width: 200,
                      height: 2,
                      alignment: Alignment.centerLeft,
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: FractionallySizedBox(
                        widthFactor: _lineProgress.value,
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF00A651),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00A651).withOpacity(0.8),
                                blurRadius: 10,
                                offset: const Offset(0, 0),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Tech/Grid Background Painter
class TechGridPainter extends CustomPainter {
  final double animationValue;
  TechGridPainter({required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF00A651).withOpacity(0.05)
      ..strokeWidth = 1.0;

    double spacing = 40.0;

    // Draw horizontal grid lines
    for (double i = 0; i < size.height; i += spacing) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }

    // Draw vertical grid lines
    for (double i = 0; i < size.width; i += spacing) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }

    // Draw random glowing nodes
    final nodePaint = Paint()
      ..color = const Color(
        0xFF00A651,
      ).withOpacity(0.2 + (animationValue * 0.2))
      ..style = PaintingStyle.fill;

    // Fixed random seeds for consistent pattern that pulses
    canvas.drawCircle(
      Offset(size.width * 0.2, size.height * 0.3),
      3,
      nodePaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.8, size.height * 0.7),
      4,
      nodePaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.2),
      2,
      nodePaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.1, size.height * 0.8),
      3,
      nodePaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.9, size.height * 0.4),
      2,
      nodePaint,
    );
  }

  @override
  bool shouldRepaint(covariant TechGridPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}
