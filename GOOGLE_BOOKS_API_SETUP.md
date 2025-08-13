# Google Books API Setup

The current Google Books API key is invalid. To fix this:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Books API
4. Create credentials (API Key)
5. Replace the `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY` in your `.env.local` file

For now, the application will use mock data to demonstrate functionality.

## Current API Key Status
❌ Invalid API Key (400 Bad Request)

## Mock Data Features
✅ Book search with sample books
✅ Book details with placeholder data
✅ Similar books recommendations
✅ All core functionality works with sample data

To get real book data, please configure a valid Google Books API key.
