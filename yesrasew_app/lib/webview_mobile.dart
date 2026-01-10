import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'dart:io';
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? _webViewController;
  late PullToRefreshController _pullToRefreshController;
  bool _isLoading = true;
  bool _isError = false;
  String _initialUrl = 'https://www.yesrasewsolution.com/welcome';
  final Color _brandColor = const Color(0xFF00A651);
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    _checkAuthAndSetUrl();

    _pullToRefreshController = PullToRefreshController(
      settings: PullToRefreshSettings(color: _brandColor),
      onRefresh: () async {
        if (Platform.isAndroid) {
          _webViewController?.reload();
        } else if (Platform.isIOS) {
          _webViewController?.loadUrl(
            urlRequest: URLRequest(url: await _webViewController?.getUrl()),
          );
        }
      },
    );

    if (Platform.isAndroid) {
      _requestPermissions();
    }

    // Check initial connectivity
    _checkConnectivity();

    // Listen for connectivity changes
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen(
      _updateConnectionStatus,
    );
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
      Permission.camera,
      Permission.microphone,
    ].request();
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    _webViewController = null;
    super.dispose();
  }

  void _reload() {
    setState(() {
      _isError = false;
      _isLoading = true;
    });
    _webViewController?.reload();
  }

  Future<void> _checkConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    _updateConnectionStatus(results);
  }

  void _updateConnectionStatus(List<ConnectivityResult> results) {
    if (!mounted) return;

    // If we have no connection types, or the only one is 'none'
    bool isOffline =
        results.isEmpty ||
        (results.length == 1 && results.first == ConnectivityResult.none);

    if (isOffline) {
      setState(() {
        _isError = true;
        // _isLoading = false; // Optional: stop loading spinner if offline
      });
      debugPrint('❌ Lost connection');
    } else {
      // We are online
      if (_isError) {
        debugPrint('✅ Connection restored - reloading');
        _reload();
      }
    }
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
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Stack(
            children: [
              // 1. WebView Layer
              if (!_isError)
                InAppWebView(
                  initialUrlRequest: URLRequest(
                    url: WebUri(
                      _initialUrl,
                    ), // Dynamic URL based on auth status
                  ),
                  pullToRefreshController: _pullToRefreshController,
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
                    // Transparent background to prevent white flash if possible,
                    // though loading overlay covers it.
                    transparentBackground: true,
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
                            backgroundColor: Colors
                                .green, // Use brand color if possible, but standard green nice here
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
                          final GoogleSignInAccount? account =
                              await googleSignIn.signIn();

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
                      _isError = false;
                    });
                    // Explicitly set the flag on every page load
                    controller.evaluateJavascript(
                      source: "window.isMobileApp = true;",
                    );
                    debugPrint('Started loading: $url');
                  },
                  onLoadStop: (controller, url) async {
                    if (mounted) {
                      try {
                        _pullToRefreshController.endRefreshing();
                      } catch (e) {
                        debugPrint('⚠️ Refresh controller error: $e');
                      }
                      setState(() {
                        _isLoading = false;
                      });
                    }
                    debugPrint('Finished loading: $url');
                  },
                  onReceivedError: (controller, request, error) {
                    if (mounted) {
                      try {
                        _pullToRefreshController.endRefreshing();
                      } catch (e) {
                        debugPrint('⚠️ Refresh controller error: $e');
                      }
                    }
                    debugPrint('WebView Error: ${error.description}');
                    // Check if it's the main frame that failed
                    if (request.isForMainFrame == true) {
                      if (mounted) {
                        setState(() {
                          _isError = true;
                          _isLoading = false;
                        });
                      }
                    }
                  },
                  onReceivedHttpError: (controller, request, response) {
                    if (mounted) {
                      try {
                        _pullToRefreshController.endRefreshing();
                      } catch (e) {
                        debugPrint('⚠️ Refresh controller error: $e');
                      }
                    }
                    debugPrint('HTTP Error: ${response.statusCode}');
                    // Optional: handle 404/500 screens, but usually web app handles 404.
                    // 500 might warrant a refresh.
                    if (request.isForMainFrame == true &&
                        response.statusCode != null &&
                        response.statusCode! >= 500) {
                      if (mounted) {
                        setState(() {
                          _isError = true;
                          _isLoading = false;
                        });
                      }
                    }
                  },
                  shouldOverrideUrlLoading: (controller, navigationAction) async {
                    final uri = navigationAction.request.url;

                    if (uri != null) {
                      final url = uri.toString();

                      // 1. Auth Redirect Handling
                      if ((url.startsWith('http://localhost') ||
                              url.startsWith('http://10.0.2.2') ||
                              url.startsWith('http://127.0.0.1')) &&
                          url.contains('access_token=')) {
                        final newUrl = url.replaceFirst(
                          RegExp(r'http://[^/]+'),
                          'https://www.yesrasewsolution.com',
                        );
                        debugPrint(
                          '🔄 Redirecting Auth to Production: $newUrl',
                        );
                        controller.loadUrl(
                          urlRequest: URLRequest(url: WebUri(newUrl)),
                        );
                        return NavigationActionPolicy.CANCEL;
                      }

                      // 2. Handle Custom Schemes (Non-HTTP) & Specialized Links
                      // This covers tel, mailto, sms, geo, AND app schemes like snssdk (TikTok), spotify, etc.
                      if (![
                        'http',
                        'https',
                        'file',
                        'chrome',
                        'data',
                        'javascript',
                        'about',
                      ].contains(uri.scheme)) {
                        debugPrint(
                          '🔗 Launching external scheme: ${uri.scheme}',
                        );
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(
                            uri,
                            mode: LaunchMode.externalApplication,
                          );
                          return NavigationActionPolicy.CANCEL;
                        }
                      }

                      // 3. Force External Launch for Known Social Domains (HTTP/HTTPS)
                      // Even if they are http links, we want them to open in their native app if installed
                      if (url.contains('wa.me') ||
                          url.contains('t.me') ||
                          url.contains('facebook.com') ||
                          url.contains('instagram.com') ||
                          url.contains('linkedin.com') ||
                          url.contains('twitter.com') ||
                          url.contains('x.com') ||
                          url.contains('tiktok.com') ||
                          url.contains('youtube.com')) {
                        debugPrint('🔗 Launching social link: $url');
                        try {
                          // Try to launch external app, fallback to browser if set to externalApplication
                          await launchUrl(
                            uri,
                            mode: LaunchMode.externalApplication,
                          );
                          return NavigationActionPolicy.CANCEL;
                        } catch (e) {
                          debugPrint('❌ Could not launch external link: $e');
                        }
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

              // 2. Loading Overlay (Professional)
              if (!_isError)
                IgnorePointer(
                  ignoring: !_isLoading,
                  child: AnimatedOpacity(
                    opacity: _isLoading ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 800),
                    curve: Curves.easeInOut,
                    child: Container(
                      color: Colors.white,
                      width: double.infinity,
                      height: double.infinity,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset(
                              'assets/logo.png',
                              width: 80,
                              height: 80,
                              // Fallback if asset missing (though it should be there)
                              errorBuilder: (context, error, stackTrace) =>
                                  Icon(
                                    Icons.public,
                                    size: 80,
                                    color: _brandColor,
                                  ),
                            ),
                            const SizedBox(height: 32),
                            SizedBox(
                              width: 32,
                              height: 32,
                              child: CircularProgressIndicator(
                                strokeWidth: 3,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _brandColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

              // 3. Error Overlay (Connection Failed)
              if (_isError)
                Container(
                  color: Colors.white,
                  width: double.infinity,
                  height: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.wifi_off_rounded,
                        size: 80,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        "No Internet Connection",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        "Please check your network settings and try again.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _reload,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _brandColor,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            "Retry",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
