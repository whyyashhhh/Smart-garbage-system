# Google Maps API Integration Guide

## 🗺️ Complete Setup Instructions

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account (create one if needed)

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "NEW PROJECT"
   - Name it: "Smart Garbage Reporting"
   - Click "CREATE"
   - Wait for the project to be created

3. **Enable Maps JavaScript API**
   - Go to: https://console.cloud.google.com/marketplace/product/google/maps-backend
   - Search for "Maps JavaScript API"
   - Click on "Maps JavaScript API"
   - Click the blue "ENABLE" button
   - Wait for it to enable (takes 1-2 minutes)

4. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "CREATE CREDENTIALS" button
   - Select "API key"
   - Your API key will appear (looks like: `AIzaSyD_X_YZ_ABC123def456...`)
   - Click the copy icon to copy it

5. **Restrict API Key (Recommended for security)**
   - In the API Credentials page, click on your key
   - Under "Application restrictions" select "HTTP referrers (web sites)"
   - Add your domain: `localhost:3000` (for development)
   - Save

---

### Step 2: Add API Key to Frontend Code

**Method 1: Edit index.html (Recommended)**

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```html
<!-- File: frontend/index.html -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD_YOUR_ACTUAL_KEY_HERE"></script>
```

**Example:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD_X_YZ_ABC123def456"></script>
```

---

### Step 3: Restart Frontend Server

After updating index.html:

```bash
# Stop the frontend server (Ctrl+C)
# Then restart it:
cd frontend
npm run dev
```

---

## ✅ Verification

Once you've added your API key:

1. **Refresh the app** in browser: http://localhost:3000
2. **Login to your account**
3. **Click "Check Your Locality"**
4. **Allow GPS access** when prompted
5. **You should see a real Google Map** with:
   - Your current location (blue dot)
   - Any garbage reports you've submitted (with distance indicators)
   - Zoom and pan controls

---

## 🎯 Map Features

Once enabled, your map will show:

- **🔵 Blue Marker**: Your current GPS location
- **♻️ Plastic Reports**: Plastic waste locations
- **🌿 Wet Waste Reports**: Organic waste locations
- **⚠️ Medical Waste Reports**: Medical waste locations
- **🗑️ Overflowing Bins**: Full garbage bins
- **⛔ Illegal Dumping**: Illegal dumping sites
- **Click markers** to see report details (type, description, status)

---

## 🔐 API Key Security

### Free Tier Limits
- **Requests per day**: 25,000 (free)
- **Cost after limit**: $7 per 1,000 additional requests

### Protect Your Key
- ✅ **DO** restrict keys to HTTP referrers
- ✅ **DO** restrict to specific APIs (Maps JavaScript API only)
- ❌ **DON'T** share your key publicly
- ❌ **DON'T** commit to GitHub without .gitignore

---

## 🚨 Troubleshooting

### Map not showing after adding API key?

**Problem**: Blank map or error in console
- Clear browser cache (Ctrl+Shift+Delete)
- Restart frontend server
- Check API key is correct in index.html
- Check Maps JavaScript API is enabled in Google Cloud

### "RefererNotAllowed" Error?

**Solution**: Check API key restrictions
- Go to Google Cloud Console → Credentials
- Click your API key
- Under "Accept requests from these HTTP referrers", make sure `localhost:3000` is listed

### "Maps not defined" Error?

**Solution**: Ensure script tag is loaded before React
- Check index.html has the Maps script **before** the React app
- Make sure there are no typos in the API key
- Reload the page (F5)

### API Key not working in production?

**Solution**: Update HTTP referrers
- Go to Google Cloud Console → Credentials
- Update the API key's HTTP referrers to include your production domain
- Example: `yourdomain.com`

---

## 💡 Advanced: Alternative Methods

### Method 2: Environment Variable (For production)

Create `.env` in frontend directory:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Then update index.html:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=%VITE_GOOGLE_MAPS_API_KEY%"></script>
```

### Method 3: Dynamic Loading in React

Instead of script tag, load in React:
```javascript
// In MapComponent.jsx
useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    document.head.appendChild(script);
}, []);
```

---

## 📞 Need Help?

- **Google Cloud Support**: https://support.google.com/cloud/
- **Maps JavaScript API Docs**: https://developers.google.com/maps/documentation/javascript
- **Check your quota**: https://console.cloud.google.com/apis/dashboard

---

**Once complete, your Smart Garbage Reporting System will have full Google Maps integration!** 🗺️✨
