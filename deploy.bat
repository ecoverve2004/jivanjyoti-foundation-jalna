@echo off
echo 🔥 JivanJyoti Foundation - Firebase Deployment Script
echo ================================================

echo.
echo ✅ Step 1: Logging into Firebase...
npx firebase login

echo.
echo ✅ Step 2: Initializing Firebase project...
npx firebase init

echo.
echo ✅ Step 3: Deploying to Firebase...
npx firebase deploy

echo.
echo 🎉 Deployment Complete!
echo Your website is now live!
echo.
echo 📊 Next: Add to Google Search Console
echo 🌐 URL: Check Firebase Console for your live URL
echo.
pause