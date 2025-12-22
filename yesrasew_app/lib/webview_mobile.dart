import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'dart:io';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? _webViewController;
  bool _isLoading = true;
  double _progress = 0;
  String _initialUrl =
      'https://www.yesrasewsolution.com/welcome'; // Default to welcome

  @override
  void initState() {
    super.initState();
    _checkAuthAndSetUrl();
    if (Platform.isAndroid) {
      _requestPermissions();
    }
  }

  Future<void> _checkAuthAndSetUrl() async {
    try {
      // Check if there's a Supabase auth cookie
      final cookieManager = CookieManager.instance();
      final cookies = await cookieManager.getCookies(
        url: WebUri('https://www.yesrasewsolution.com'),
      );

      // Look for Supabase auth tokens in cookies
      final hasAuthCookie = cookies.any(
        (cookie) =>
            cookie.name.contains('sb-') && cookie.name.contains('auth-token'),
      );

      if (hasAuthCookie) {
        debugPrint('✅ Found auth session - loading homepage');
        setState(() {
          _initialUrl = 'https://www.yesrasewsolution.com/';
        });
      } else {
        debugPrint('❌ No auth session - loading welcome page');
        setState(() {
          _initialUrl = 'https://www.yesrasewsolution.com/welcome';
        });
      }
    } catch (e) {
      debugPrint('⚠️ Error checking auth: $e - defaulting to welcome');
      setState(() {
        _initialUrl = 'https://www.yesrasewsolution.com/welcome';
      });
    }
  }

  Future<void> _requestPermissions() async {
    await [
      Permission.camera,
      Permission.microphone,
      Permission.storage,
      Permission.photos,
      Permission.videos,
    ].request();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_webViewController != null) {
          bool canGoBack = await _webViewController!.canGoBack();
          if (canGoBack) {
            _webViewController!.goBack();
            return false;
          }
        }
        return true;
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(
                  url: WebUri(_initialUrl), // Dynamic URL based on auth status
                ),
                initialSettings: InAppWebViewSettings(
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  useHybridComposition: true,
                  allowFileAccess: true,
                  allowContentAccess: true,
                  mediaPlaybackRequiresUserGesture: false,
                  // Enable file upload
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                  // Improve compatibility with Google Sign-In
                  userAgent:
                      "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                  applicationNameForUserAgent: "Chrome", // Spoof Chrome
                ),
                onWebViewCreated: (controller) {
                  _webViewController = controller;
                  debugPrint('✅ WebView created successfully');

                  // Add JavaScript handler for Google Sign-In
                  controller.addJavaScriptHandler(
                    handlerName: 'GoogleSignInApp',
                    callback: (args) async {
                      debugPrint('Google Sign-In requested from web: $args');

                      // Visual confirmation for the user
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('📱 Native Google Login Triggered'),
                          backgroundColor: Colors.green,
                          duration: Duration(seconds: 1),
                        ),
                      );

                      try {
                        debugPrint('🚀 Starting Google Sign-In Flow');

                        // Create a fresh GoogleSignIn instance with force refresh
                        final GoogleSignIn googleSignIn = GoogleSignIn(
                          scopes: ['email', 'profile'],
                          // Force refresh token to bypass cached credentials
                          forceCodeForRefreshToken: true,
                        );

                        // CRITICAL: Disconnect AND sign out to clear all cached data
                        // disconnect() revokes access tokens
                        // signOut() clears the signed-in user
                        try {
                          final currentUser = await googleSignIn
                              .signInSilently();
                          if (currentUser != null) {
                            debugPrint(
                              '📋 Found cached user: ${currentUser.email}',
                            );
                            await googleSignIn.disconnect();
                            debugPrint('✅ Disconnected previous account');
                          }
                        } catch (e) {
                          debugPrint('⚠️ No cached account: $e');
                        }

                        // Additional signOut to be absolutely sure
                        await googleSignIn.signOut();
                        debugPrint('✅ Signed out completely');

                        debugPrint(
                          '🚀 Requesting Google Account Picker (signIn)...',
                        );

                        // This should now show the account picker
                        final GoogleSignInAccount? account = await googleSignIn
                            .signIn();

                        if (account == null) {
                          debugPrint(
                            '❌ Google Sign-In Cancelled by user (account is null)',
                          );
                          return;
                        }

                        debugPrint(
                          '✅ Google Account Selected: ${account.email}',
                        );

                        final GoogleSignInAuthentication auth =
                            await account.authentication;
                        final String? idToken = auth.idToken;

                        debugPrint(
                          '🔑 Got ID Token: ${idToken != null ? "YES (Length: ${idToken.length})" : "NO"}',
                        );

                        if (idToken != null) {
                          // Get metadata from args
                          String metaData = "{}";
                          if (args.isNotEmpty &&
                              args[0] is Map &&
                              args[0]['metaData'] != null) {
                            metaData = args[0]['metaData'].toString();
                          }

                          // Inject back to Web
                          await controller.evaluateJavascript(
                            source:
                                "window.handleNativeGoogleLogin('$idToken', '$metaData');",
                          );

                          debugPrint('✅ Sent token to web');
                        }
                      } catch (e) {
                        debugPrint('❌ Google Sign In Error: $e');
                      }
                    },
                  );
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    _isLoading = true;
                  });
                  // Explicitly set the flag on every page load
                  controller.evaluateJavascript(
                    source: "window.isMobileApp = true;",
                  );
                  debugPrint('Started loading: $url');
                },
                onLoadStop: (controller, url) async {
                  setState(() {
                    _isLoading = false;
                  });
                  debugPrint('Finished loading: $url');
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    _progress = progress / 100;
                  });
                },
                onLoadError: (controller, url, code, message) {
                  debugPrint('Load error: $message');
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  final uri = navigationAction.request.url;

                  if (uri != null) {
                    final url = uri.toString();

                    // FIX: Intercept localhost redirects from Google OAuth and route to production
                    if ((url.startsWith('http://localhost') ||
                            url.startsWith('http://10.0.2.2') ||
                            url.startsWith('http://127.0.0.1')) &&
                        url.contains('access_token=')) {
                      // Replace localhost/port with production domain
                      // Preserves the #access_token fragment
                      final newUrl = url.replaceFirst(
                        RegExp(r'http://[^/]+'),
                        'https://www.yesrasewsolution.com',
                      );

                      debugPrint('🔄 Redirecting Auth to Production: $newUrl');
                      controller.loadUrl(
                        urlRequest: URLRequest(url: WebUri(newUrl)),
                      );
                      return NavigationActionPolicy.CANCEL;
                    }

                    // Handle external links
                    if (url.startsWith('tel:') ||
                        url.startsWith('mailto:') ||
                        url.startsWith('sms:') ||
                        url.startsWith('whatsapp:') ||
                        url.contains('wa.me')) {
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(
                          uri,
                          mode: LaunchMode.externalApplication,
                        );
                      }
                      return NavigationActionPolicy.CANCEL;
                    }
                  }

                  return NavigationActionPolicy.ALLOW;
                },
                // THIS IS THE KEY: Android file chooser
                androidOnPermissionRequest:
                    (controller, origin, resources) async {
                      debugPrint('📱 Permission requested for: $resources');
                      return PermissionRequestResponse(
                        resources: resources,
                        action: PermissionRequestResponseAction.GRANT,
                      );
                    },
                // File upload handler - this is what makes it work!
                onCreateWindow: (controller, createWindowAction) async {
                  debugPrint('Create window requested');
                  return true;
                },
              ),
              if (_isLoading)
                LinearProgressIndicator(
                  value: _progress > 0 ? _progress : null,
                  backgroundColor: Colors.grey[200],
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
