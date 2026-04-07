# Smart Garbage Reporting System - Quick Start Guide

## ⚡ Quick Start (5 Minutes)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

## 📝 Test Credentials

You can create a test account:
- Email: test@example.com
- Password: password123

## 🗺️ Google Maps Setup (Optional)

1. Get API key from: https://console.cloud.google.com/
2. Add to `frontend/index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>
```
3. Uncomment code in `MapComponent.jsx`

## 🗄️ MongoDB Setup

### Local MongoDB
```bash
# Windows
mongod

# Mac
brew services start mongodb-community
```

### MongoDB Atlas (Cloud)
Update in `backend/.env`:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-garbage
```

## 📁 File Structure Summary

```
smart-garbage-reporting-system/
├── backend/          # Express + MongoDB
│   ├── models/       # User, Report schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # JWT auth
│   └── server.js     # Main server file
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/    # Login, Signup, Dashboard, Reports
    │   ├── components/ # Navbar, Map, Modal, Toast
    │   └── services/ # API calls
    └── index.html
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-garbage-reporting
JWT_SECRET=change-this-secret-key
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## ▲ Vercel Deployment

This repo is ready for Vercel with rewrites defined in `vercel.json`.

### 1. Create a Vercel Project
- Import the repository and keep Root Directory as repository root (`.` / empty).
- `vercel.json` controls these settings:
  - Install Command: `npm --prefix frontend install; npm --prefix backend install`
  - Build Command: `npm --prefix frontend run build`
  - Output Directory: `frontend/dist`
- If Build/Output fields are disabled in Vercel UI, that is expected.

### 2. Set Environment Variables (Vercel Dashboard)
Backend:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

Frontend (optional, defaults to `/api`):
- `VITE_API_URL=/api` (optional; frontend uses `/api` in production by default)
- `VITE_UPLOADS_URL` (only if you serve uploads from a separate host)

### 3. Deploy
- Push to `main` or trigger a manual deploy.

### 4. Note on Uploads
Vercel functions do not provide persistent disk storage. Uploaded images will not persist across deployments or cold starts. Use external storage (S3, Cloudinary, etc.) for production uploads.

## 📱 Features Checklist

- ✅ User authentication (Signup/Login)
- ✅ Protected dashboard
- ✅ GPS location detection
- ✅ Google Maps placeholder
- ✅ Report garbage modal
- ✅ Image upload
- ✅ My Reports page
- ✅ Report filtering (Pending/Resolved)
- ✅ Toast notifications
- ✅ Responsive design

## 🐛 Troubleshooting

### Backend won't start
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend won't connect to backend
- Check if backend is running on port 5000
- Check VITE_API_URL in .env file
- Check CORS in server.js

### MongoDB connection error
- Ensure MongoDB is running locally or in cloud
- Check connection string in .env

## 📚 API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Report
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "garbageType=Plastic" \
  -F "description=Some garbage" \
  -F "latitude=28.7041" \
  -F "longitude=77.1025" \
  -F "image=@path/to/image.jpg"
```

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
    primary: '#your-color',
}
```

### Change Port
Backend: `backend/.env` → PORT=3000
Frontend: `frontend/vite.config.js` → port: 4000

## 📞 Support

For detailed documentation, see [README.md](./README.md)

---
**Made with 💚 for a cleaner environment!**
