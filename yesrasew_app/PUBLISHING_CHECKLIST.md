# Play Store Publishing Checklist ✅

## Before You Start
- [ ] Google Play Console account created ($25 paid)
- [ ] Business email ready
- [ ] Website with privacy policy live

## Assets Needed
- [ ] App screenshots (minimum 2, recommended 8)
  - Size: 1080 x 1920 pixels (portrait)
  - Format: PNG or JPEG
- [ ] Feature graphic (1024 x 500 pixels)
- [ ] App icon (512 x 512 pixels) ✅ Already done
- [ ] Short description (80 chars max)
- [ ] Full description (up to 4000 chars)

## Build the App
- [ ] Run: `flutter build appbundle --release`
- [ ] Verify file exists: `build/app/outputs/bundle/release/app-release.aab`
- [ ] File size is reasonable (40-50 MB)

## Play Console Setup
- [ ] Create new app in Play Console
- [ ] Complete main store listing
- [ ] Upload app icon
- [ ] Upload feature graphic
- [ ] Upload screenshots
- [ ] Add descriptions
- [ ] Set contact details

## Policy & Content
- [ ] Complete content rating questionnaire
- [ ] Set app access (unrestricted)
- [ ] Declare ads (Yes/No)
- [ ] Add privacy policy URL
- [ ] Complete data safety form
  - [ ] List collected data
  - [ ] Explain data usage
  - [ ] Confirm encryption
  - [ ] Confirm deletion policy

## Release
- [ ] Upload app bundle (.aab)
- [ ] Add release notes
- [ ] Set version name (1.0.0)
- [ ] Select countries (Ethiopia + others)
- [ ] Confirm pricing (Free)
- [ ] Review all sections for errors

## Final Steps
- [ ] Fix any warnings/errors
- [ ] Submit for review
- [ ] Wait for approval (1-7 days)
- [ ] Test live listing after approval

## Post-Launch
- [ ] Monitor reviews daily
- [ ] Respond to user feedback
- [ ] Track analytics
- [ ] Plan first update

## Important - Keep Safe! 🔐
- [ ] Backup keystore file (3 locations)
- [ ] Save passwords in password manager
  - Store password: yesrasew2024
  - Key password: yesrasew2024
  - Alias: upload
- [ ] Never commit keystore to Git

## Quick Commands
```powershell
# Build app bundle
flutter build appbundle --release

# Stop Gradle if needed
cd android; .\gradlew --stop

# Clean build
flutter clean; flutter pub get
```

---

**App Details:**
- Name: Yesra Sew Solution
- Package: com.yesrasewsolution.app
- Version: 1.0.0
- Website: https://www.yesrasewsolution.com

**Timeline:**
- Setup: 1-2 hours
- Review: 1-7 days
- Total: 2-8 days

Good luck! 🚀
