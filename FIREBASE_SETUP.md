# Firebase Setup Guide for YourBookList

## Problem Identified
The Firebase project "yourbooklist" does not exist, which is why the API key is invalid.

## Solution: Create a New Firebase Project

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Project name: `yourbooklist` (or any name you prefer)
4. Enable Google Analytics if desired
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Enable "Google" provider (optional)

### Step 3: Set up Firestore Database
1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now
4. Select a location close to your users

### Step 4: Get Configuration
1. Go to Project Settings (gear icon) > General
2. Scroll down to "Your apps"
3. Click "Add app" > Web app icon (</>)
4. App nickname: `yourbooklist-web`
5. Check "Also set up Firebase Hosting" if you want
6. Click "Register app"
7. Copy the configuration object

### Step 5: Update Environment Variables
Replace the values in your `.env.local` file with the new configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_new_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 6: Restart Development Server
After updating `.env.local`, restart your development server:
```bash
npm run dev
```

## Security Rules (Important!)
Before going to production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Books can be read by anyone, written by authenticated users
    match /books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Temporary Working Configuration
If you want to test quickly, you can create a demo project with these steps and I'll help you set it up.
