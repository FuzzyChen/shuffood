# Shuffood - Setup Guide

A mobile-first React app that helps you decide what to eat by shuffling nearby restaurants using Google Maps API!

## Features

- 🗺️ Find nearby restaurants based on your location
- 🎲 Shuffle restaurants to randomly pick one
- ⭐ View restaurant ratings and addresses
- 📍 Distance information for each restaurant
- 🎯 Adjustable distance range filter (250m - 5km)
- 📍 Automatic geolocation detection
- 🎨 Beautiful, responsive mobile-first UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Maps API key with Places API enabled

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. **Enable these APIs:**
   - ✅ **Places API** (required for searching restaurants)
   - ✅ **Maps JavaScript API** (optional, for future map features)
4. **Go to Credentials** and create an API Key
5. **Enable in your API key:**
   - Places API
   - Maps JavaScript API (recommended)
6. **Restrict the key (optional but recommended):**
   - HTTP referrers: Add your domain
   - Or use `localhost:5173` for development

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key to `.env.local`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

1. **Allow Location Access** - Grant geolocation permission to see an embedded map of your current location (defaults to San Francisco if unavailable)
2. **Select Cuisine Types** - Click cuisine buttons to filter by type (Mexican, Chinese, Italian, Japanese, etc.)
   - Multiple selections are supported - find restaurants matching any selected cuisine
   - Click again to deselect a cuisine
3. **Adjust Distance Range** - Use the slider to set your search radius (1 - 30 miles)
4. **Find Restaurants** - Click "Find Restaurants" to search for nearby restaurants
5. **Watch the Shuffle Animation** - Click "Shuffle" or "Try Another" to start the 3-second shuffle animation
6. **View Restaurant List** - Browse available restaurants at the bottom of the page
7. **Click to Select** - Click any restaurant in the list to view its details
8. **Adjust Anytime** - Change cuisine or distance filters anytime to refine results dynamically

## Using the New Places API

This app uses the **Google Places API (New)** v1 with proper field masking. Key features:

1. Uses `places.googleapis.com/v1/places:searchNearby` endpoint
2. Includes required `X-Goog-FieldMask` header for field specification
3. Only requests necessary fields for better performance:
   - `places.displayName` - Restaurant name
   - `places.id` - Unique identifier
   - `places.formattedAddress` - Full address
   - `places.rating` - Star rating
   - `places.location` - Coordinates for distance calculation
4. Distances calculated locally using Haversine formula
5. Automatically converts between miles and meters internally

## Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## Technologies Used

- React 19
- TypeScript
- Vite
- Google Maps JavaScript API (Places Service)
- Haversine distance calculation

## Features Explained

### Embedded Location Map
- Shows your current location with Google Maps embed
- Zoom level set to 15 for neighborhood view
- Automatically centered on your location
- Works on mobile with interactive map controls

### Cuisine Type Filters
- **12 cuisine options:** Mexican, Chinese, Italian, Japanese, Indian, Thai, Korean, Vietnamese, Spanish, French, American, Middle Eastern
- **Multi-select support** - Choose multiple cuisines to find restaurants matching any selection
- **Smart keyword matching** - Recognizes cuisine-related keywords in restaurant names
- **Real-time filtering** - Results update instantly when cuisine selection changes
- **Visual feedback** - Active cuisines highlighted with gradient background
- **Mobile-friendly** - Cuisine buttons wrap and stack on smaller screens

### 3-Second Shuffle Animation
- Randomly cycles through restaurants for 3 seconds
- Updates every 100ms for smooth visual effect
- Buttons show "Shuffling..." state during animation
- Automatically selects final restaurant after animation completes

### Interactive Restaurant List
- Shows all available restaurants at the bottom
- Numbered list with rating and distance information
- Click any restaurant to view its full details
- Active restaurant highlighted with gradient background
- Scrollable with custom styling for smooth browsing
- Touch-friendly design for mobile

### Distance Range Filter
- Dynamically filter restaurants by distance (1 - 30 miles)
- Instantly updates the restaurant count
- Distance calculated using precise Haversine formula
- Shows distance for each restaurant in miles
- Works in combination with cuisine filters

### Mobile-First Design
- Fully responsive layout optimized for mobile
- Touch-friendly controls and buttons
- Map scales appropriately on smaller screens
- Restaurant list scrollable on mobile
- Cuisine buttons wrap naturally on small screens
- Gradient backgrounds for visual appeal

## Notes

- Make sure your API key has proper restrictions
- Requires the Places API and Maps Embed API enabled
- Requires geolocation permission in the browser
- Uses local calculations for distance filtering (no API calls)
- Distances are calculated in real-time and shown in miles
- Cuisine filtering uses smart keyword matching on restaurant names
