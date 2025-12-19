import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:url_launcher/url_launcher.dart';
import 'dart:html' as html;
import 'dart:ui' as ui;

// Only import WebView for non-web platforms
import 'package:webview_flutter/webview_flutter.dart'
    if (dart.library.html) 'dart:html';

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

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  bool _isLoading = true;
  late WebViewController _controller;

  @override
  void initState() {
    super.initState();

    if (kIsWeb) {
      // For web platform, register the iframe
      _registerIframeView();
    } else {
      // For mobile platforms, use WebView
      _initializeWebView();
    }
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

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Optional: Update a progress bar
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('Web resource error: ${error.description}');
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onNavigationRequest: (NavigationRequest request) async {
            final Uri uri = Uri.parse(request.url);
            if (uri.scheme == 'tel' ||
                uri.scheme == 'mailto' ||
                uri.scheme == 'sms' ||
                uri.scheme == 'whatsapp' ||
                request.url.contains('wa.me')) {
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://yesrasewsolution.com'));
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      // Web platform: Use HtmlElementView
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
    } else {
      // Mobile platforms: Use WebView
      return WillPopScope(
        onWillPop: () async {
          if (await _controller.canGoBack()) {
            await _controller.goBack();
            return false;
          }
          return true;
        },
        child: Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            child: Stack(
              children: [
                WebViewWidget(controller: _controller),
                if (_isLoading)
                  const Center(
                    child: CircularProgressIndicator(color: Color(0xFF00A651)),
                  ),
              ],
            ),
          ),
        ),
      );
    }
  }
}
