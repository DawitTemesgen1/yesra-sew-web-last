import 'package:flutter/material.dart';
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  bool _isLoading = true;
  final String viewType =
      'yesrasew-iframe-${DateTime.now().millisecondsSinceEpoch}';

  @override
  void initState() {
    super.initState();
    _registerIframeView();
  }

  void _registerIframeView() {
    // Register iframe for web platform
    ui_web.platformViewRegistry.registerViewFactory(viewType, (int viewId) {
      final iframe = html.IFrameElement()
        ..src = 'https://yesrasewsolution.com'
        ..style.border = 'none'
        ..style.height = '100%'
        ..style.width = '100%';

      // Listen for load events
      iframe.onLoad.listen((event) {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      });

      return iframe;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          HtmlElementView(viewType: viewType),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF00A651)),
            ),
        ],
      ),
    );
  }
}
