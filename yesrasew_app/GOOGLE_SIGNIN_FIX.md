# Google Sign-In Account Picker Fix - Investigation Report

## Problem Statement
The Flutter WebView app was auto-logging in with a cached Google account instead of showing the account picker, preventing users from choosing which email account to use.

## Root Cause Analysis

### Issue 1: Mobile App Bypass
**Location:** `src/pages/EnhancedAuthPage.js` lines 682-684
**Problem:** The web app had a special check for mobile apps that bypassed the account type selection dialog entirely.
```javascript
if (window.isMobileApp || window.flutter_inappwebview) {
    processGoogleLogin();  // Skipped account type dialog
    return;
}
```
**Fix:** Removed this bypass so mobile users see the same account type dialog as web users.

### Issue 2: Google Sign-In Account Caching
**Location:** `yesrasew_app/lib/webview_mobile.dart`
**Problem:** Android's Google Sign-In SDK caches the last used account at multiple levels:
1. **Signed-in state** - cleared by `signOut()`
2. **Access tokens** - cleared by `disconnect()`
3. **Account selection** - persists even after signOut/disconnect

**Attempted Solutions:**
1. ❌ `signOut()` alone - doesn't clear account selection
2. ❌ `disconnect()` alone - may fail if no account is signed in
3. ✅ **Combined approach** - check for cached user first, then disconnect + signOut

## Implemented Solution

### Step 1: Check for Cached User
```dart
final currentUser = await googleSignIn.signInSilently();
if (currentUser != null) {
    debugPrint('📋 Found cached user: ${currentUser.email}');
    await googleSignIn.disconnect();
}
```

### Step 2: Force Refresh Token
```dart
final GoogleSignIn googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    forceCodeForRefreshToken: true,  // Bypass cached credentials
);
```

### Step 3: Complete Sign Out
```dart
await googleSignIn.signOut();
debugPrint('✅ Signed out completely');
```

### Step 4: Fresh Sign-In
```dart
final GoogleSignInAccount? account = await googleSignIn.signIn();
```

## Testing Instructions

### Test Case 1: Account Type Selection
1. Open the Flutter app
2. Navigate to registration/auth page
3. Click "Continue with Google"
4. **Expected:** Dialog appears asking "Individual" or "Company"
5. Select account type
6. **Expected:** Google account picker appears

### Test Case 2: Multiple Accounts
1. Ensure you have multiple Google accounts on your device
2. Follow Test Case 1
3. **Expected:** All your Google accounts should be listed
4. Select any account
5. **Expected:** Login completes with selected account

### Test Case 3: Repeat Login
1. Complete a Google login
2. Log out from the app
3. Click "Continue with Google" again
4. **Expected:** Account picker shows again (not auto-login)

## Debug Logging

The app now includes comprehensive logging. Check the console for:
- `🚀 Starting Google Sign-In Flow`
- `📋 Found cached user: [email]` (if cached account exists)
- `✅ Disconnected previous account`
- `✅ Signed out completely`
- `🚀 Requesting Google Account Picker (signIn)...`
- `✅ Google Account Selected: [email]`
- `🔑 Got ID Token: YES (Length: [number])`
- `✅ Sent token to web`

## Known Limitations

### Android Smart Lock
Android's Smart Lock feature may still auto-fill credentials in some cases. This is a system-level feature that apps cannot fully override. Users can disable this in:
**Settings > Google > Smart Lock for Passwords**

### Account Picker Behavior
The account picker will show:
- All Google accounts added to the device
- Option to add a new account
- Last used account may be highlighted but NOT auto-selected

## Files Modified

1. **`src/pages/EnhancedAuthPage.js`**
   - Removed mobile app bypass for account type dialog
   - Lines 679-691

2. **`yesrasew_app/lib/webview_mobile.dart`**
   - Added `forceCodeForRefreshToken: true`
   - Implemented smart disconnect logic
   - Added comprehensive debug logging
   - Lines 96-173

## Next Steps

If the account picker still doesn't show after these changes:

1. **Clear App Data:**
   ```
   Settings > Apps > Yesra Sew > Storage > Clear Data
   ```

2. **Check Google Play Services:**
   - Ensure Google Play Services is up to date
   - Try signing out of all Google accounts in device settings
   - Sign back in and test again

3. **Alternative Approach:**
   - Consider implementing a custom account picker UI
   - Store multiple accounts in app and let user choose
   - Use selected account's credentials for Google Sign-In

## References
- [Google Sign-In Flutter Plugin](https://pub.dev/packages/google_sign_in)
- [Android Account Picker](https://developers.google.com/identity/sign-in/android/sign-in)
- [Google Sign-In Best Practices](https://developers.google.com/identity/sign-in/web/sign-in)
