# Smart Garbage Reporting System

A modern, full-stack web application for reporting and tracking garbage issues in your locality using GPS location and Google Maps integration.

## 🌟 Features

### Authentication
- ✅ User registration and login with secure JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ Protected routes - only logged-in users can access dashboard
- ✅ Glass morphism UI design for auth pages

### Dashboard
- ✅ Modern navbar with logout functionality
- ✅ GPS location detection with browser geolocation API
- ✅ Google Maps integration (placeholder - add your API key)
- ✅ Floating action button for quick reporting
- ✅ Statistics cards showing user activity

### Report Garbage
- ✅ Modal form with garbage type selection
- ✅ Image upload functionality
- ✅ Location coordinates capture
- ✅ Real-time form validation
- ✅ Toast notifications for feedback

### My Reports Page
- ✅ View all submitted reports in card format
- ✅ Filter by status (Pending/Resolved)
- ✅ Change report status
- ✅ Delete reports
- ✅ Display images, location, and timestamps

### Garbage Types Supported
- 🗑️ Plastic
- 🌱 Wet Waste
- ⚠️ Medical Waste
- 🗑️ Overflowing Bin
- ⛔ Illegal Dumping

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Google Maps JavaScript API** - Map integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
smart-garbage-reporting-system/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Reports.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MapComponent.jsx
│   │   │   ├── ReportModal.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Google Maps API Key (optional but recommended)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-garbage-reporting
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## ▲ Deploy to Vercel

This repo includes a monorepo Vercel config at `vercel.json` for both frontend and backend.

### Steps
1. Create a new Vercel project and set the root directory to `smart-garbage-reporting-system`.
2. Add environment variables:
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `NODE_ENV=production`
    - `VITE_API_URL=/api` (optional)
    - `VITE_UPLOADS_URL` (only if serving uploads from another host)
3. Deploy.

### Uploads in Production
Vercel functions do not provide persistent disk storage. For production, use external storage (S3, Cloudinary, etc.) for image uploads.

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Reports
- `POST /api/reports` - Create new report (requires auth)
- `GET /api/reports/user` - Get user's reports (requires auth)
- `GET /api/reports/all` - Get all reports (public)
- `GET /api/reports/:id` - Get single report
- `PUT /api/reports/:id` - Update report status (requires auth)
- `DELETE /api/reports/:id` - Delete report (requires auth)

## 🗺️ Google Maps Integration

To enable Google Maps:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. In `frontend/index.html`, uncomment and update:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
```

3. In `frontend/src/components/MapComponent.jsx`, replace the placeholder and uncomment the Google Maps initialization code.

## 📤 Image Upload

Images are stored in the `backend/uploads/` directory. Configure your server to serve these files:

```javascript
app.use('/uploads', express.static('uploads'));
```

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing
- ✅ Protected API routes with middleware
- ✅ Input validation
- ✅ File upload validation (image types only)
- ✅ CORS configuration
- ✅ Environment variables for sensitive data

## 🎨 UI/UX Features

- 🎨 Glassmorphism design on login/signup pages
- 🎯 Responsive mobile-first design
- ⚡ Smooth animations and transitions
- 🔔 Toast notifications
- 📍 Floating action buttons
- 🌈 Gradient backgrounds
- 💫 Loading spinners

## 📝 Database Models

### User Model
```javascript
{
    name: String,
    email: String (unique),
    password: String (hashed),
    createdAt: Date
}
```

### Report Model
```javascript
{
    userId: ObjectId (reference to User),
    garbageType: String (enum),
    description: String,
    image: String,
    latitude: Number,
    longitude: Number,
    status: String (Pending/Resolved),
    createdAt: Date
}
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or update `MONGODB_URI` with your MongoDB Atlas connection string
- Check username and password in connection string

### Port Already in Use
- Frontend: Change port in `vite.config.js`
- Backend: Change PORT in `.env` file

### CORS Errors
- Ensure backend CORS is properly configured
- Check API_URL in frontend matches backend server

### Image Upload Not Working
- Ensure `uploads/` directory exists in backend
- Check multer configuration
- Verify file size limits

## 📦 Build for Production

### Frontend
```bash
cd frontend
npm run build
```

Output will be in `dist/` directory

### Backend
No build needed - deploy `server.js` with all dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

For issues and questions, please open an issue in the repository.

## 🎯 Future Enhancements

- [ ] Real-time report updates with Socket.IO
- [ ] Admin dashboard for authorities
- [ ] Report comments and discussion
- [ ] Reward system for active reporters
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and statistics
- [ ] Email notifications
- [ ] Social sharing features
- [ ] Report severity levels
- [ ] QR codes for locations

---

**Happy Reporting! 🗑️💚**
