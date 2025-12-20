import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';

class WebViewScreen extends StatefulWidget {
  final WebViewController? controller; // ADDED: Optional controller

  const WebViewScreen({super.key, this.controller});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    // Use passed controller if available, otherwise create new
    if (widget.controller != null) {
      _controller = widget.controller!;
      _isLoading = false; // Assume pre-loaded if controller passed
    } else {
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
        ..loadRequest(Uri.parse('https://www.yesrasewsolution.com'));
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (await _controller.canGoBack()) {
          await _controller.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        backgroundColor: Colors.white,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(0),
          child: AppBar(
            elevation: 0,
            backgroundColor: Colors.white,
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarColor: Colors.white,
              statusBarIconBrightness: Brightness.dark,
              statusBarBrightness: Brightness.light,
            ),
          ),
        ),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading)
                Container(
                  color: Colors.white,
                  child: const Center(
                    child: CircularProgressIndicator(color: Color(0xFF00A651)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
