import 'package:flutter/material.dart';
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

// import 'package:webview_flutter/src/webview_controller.dart'; // Removed

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key}); // Controller no longer required

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
        ..src =
            'http://localhost:3000' // Load from local React dev server
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%'
        ..style.position = 'absolute'
        ..style.top = '0'
        ..style.left = '0'
        ..allowFullscreen = true;

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
      body: SizedBox.expand(
        child: Stack(
          children: [
            HtmlElementView(viewType: viewType),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(color: Color(0xFF00A651)),
              ),
          ],
        ),
      ),
    );
  }
}
