import 'package:flutter/material.dart';
import 'dart:html' as html;
import 'dart:ui' as ui;

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _registerIframeView();
  }

  void _registerIframeView() {
    // Register iframe for web platform
    // ignore: undefined_prefixed_name
    ui.platformViewRegistry.registerViewFactory('yesrasew-iframe', (
      int viewId,
    ) {
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
          const HtmlElementView(viewType: 'yesrasew-iframe'),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF00A651)),
            ),
        ],
      ),
    );
  }
}
