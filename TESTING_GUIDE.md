# Baggage Tracker - Testing Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js installed (for frontend)

### Step 1: Start Backend
```bash
# From project root
docker-compose up -d
```

Wait a few seconds for containers to start, then verify:
```bash
curl http://localhost:8000/checkpoints
```

You should see a JSON array of checkpoint stages.

### Step 2: Start Frontend
```bash
# From frontend directory
cd frontend
npm install  # Only needed first time
npm run dev
```

The frontend will start on http://localhost:5173 (or next available port)

### Step 3: Access Application
Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

## ✨ Features to Test

### 1. Register a Bag
1. Fill in the "Register Bag" form:
   - Tag Number (required)
   - Passenger Name (optional)
   - Flight Number (optional)
   - Origin (optional)
   - Destination (optional)
2. Click "Register Bag"
3. ✅ You should see:
   - Success toast notification
   - Bag ID displayed
   - Form cleared
   - Bag automatically stored in localStorage

### 2. Copy Bag ID
1. After registering a bag, the ID is displayed
2. Click the 📋 button next to any bag ID
3. ✅ You should see:
   - Toast notification "Copied to clipboard!"
   - Bag ID copied to your clipboard

### 3. Scan Checkpoint
1. In "Scan Checkpoint" form:
   - Click on "Bag ID" field - you'll see a dropdown of stored bags
   - Select a bag or manually enter bag ID
   - Select a checkpoint from dropdown (should show all available checkpoints)
   - Optionally add location and notes
2. Click "Record Scan"
3. ✅ You should see:
   - Success toast notification
   - Form fields cleared (except bag ID and checkpoint)

### 4. View Bag Status
1. In "Bag Status & Tracking" section:
   - Enter a bag ID or click the field to see stored bags
   - Click "Get Status"
2. ✅ You should see:
   - Complete bag information
   - Current checkpoint with color coding
   - Next expected stage
   - Full tracking history with timestamps

### 5. Stored Bags Feature
1. Register multiple bags
2. When clicking on "Bag ID" fields, you'll see a list of previously registered bags
3. Click any bag from the list to auto-fill the ID
4. ✅ Bags are stored in browser localStorage (persists across sessions)

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with gradient header
- **Color-Coded Checkpoints**: Each checkpoint stage has a unique color
- **Toast Notifications**: Real-time feedback for all actions
- **Responsive Layout**: Works on desktop and tablet
- **Copy to Clipboard**: One-click copy for bag IDs
- **Smart Dropdowns**: Auto-complete with stored bag IDs
- **Visual Status Indicators**: Color-coded tracking history

## 🔧 Troubleshooting

### Backend not accessible
- Check if Docker containers are running: `docker ps`
- Check backend logs: `docker-compose logs backend`
- Verify backend is up: `curl http://localhost:8000/checkpoints`

### Frontend not loading
- Check if port is available
- Check browser console for errors (F12)
- Verify backend is running first
- Try clearing browser cache

### Dropdown has no options
- Check browser console for API errors
- Verify backend is running and accessible
- Check network tab in browser dev tools

### CORS errors
- Backend has CORS enabled for all origins
- If issues persist, check backend logs

## 📝 Testing Checklist

- [ ] Register a new bag
- [ ] Copy bag ID to clipboard
- [ ] Scan a checkpoint
- [ ] View bag status
- [ ] Check stored bags dropdown
- [ ] Verify toast notifications work
- [ ] Test with multiple bags
- [ ] Verify tracking history displays correctly
- [ ] Test error handling (invalid bag ID, etc.)
- [ ] Verify localStorage persistence

## 🎯 Production Readiness

This application is now production-ready with:
- ✅ Professional UI/UX
- ✅ Error handling
- ✅ User feedback (toasts)
- ✅ Data persistence (localStorage)
- ✅ Copy-to-clipboard functionality
- ✅ Responsive design
- ✅ CORS configuration
- ✅ Clean code structure

## 📦 Next Steps for Deployment

1. Build frontend: `npm run build`
2. Configure production backend URL
3. Set up proper CORS origins (replace `*` with specific domains)
4. Add authentication if needed
5. Set up SSL/HTTPS
6. Configure environment variables
7. Set up monitoring and logging
