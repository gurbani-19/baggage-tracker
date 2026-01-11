# ✈️ Baggage Tracker

A professional, production-ready baggage tracking and management system with automation capabilities. Track luggage through airport checkpoints with real-time status monitoring, operational state derivation, and comprehensive audit trails.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Python](https://img.shields.io/badge/python-3.11-blue)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.100.0-green)

## 🎯 Features

### Core Functionality
- ✅ **Bag Registration** - Register bags with tag numbers, passenger info, and flight details
- ✅ **Checkpoint Tracking** - Record scans at 11 different checkpoint stages
- ✅ **Status Inquiry** - Real-time bag status with complete history
- ✅ **QR Code Generation** - Automatic QR codes for bag labels
- ✅ **Operational State** - Intelligent state derivation from checkpoint history

### Automation Features
- 🔄 **Barcode Scanner Support** - USB keyboard wedge mode
- 📷 **QR Code Scanning** - Camera-based scanning
- 📦 **Batch Operations** - Process hundreds of bags at once
- 🎯 **Auto Checkpoint Assignment** - Location-based automatic routing
- 📊 **Scanner Management** - Register and manage scanner devices

### Advanced Features
- 🧠 **State Interpretation** - Derives operational state from events
- ⚠️ **Risk Assessment** - Detects delays and assesses risk levels
- 📈 **Journey Progress** - Visual timeline of bag journey
- 💾 **Local Storage** - Automatic bag ID storage for quick access
- 📋 **Copy to Clipboard** - One-click bag ID copying

## 🏗️ Architecture

- **Frontend**: React 18 + Vite
- **Backend**: FastAPI + SQLModel
- **Database**: PostgreSQL 15
- **Deployment**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js (for frontend development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/baggage-tracker.git
   cd baggage-tracker
   ```

2. **Start Backend & Database**
   ```bash
   docker-compose up -d
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📖 Usage

### Manual Entry
1. Register a bag with tag number and passenger details
2. Scan checkpoints manually by selecting from dropdown
3. View status to see complete tracking history

### Automated Scanning
1. Register scanners in "Manage Scanners" tab
2. Connect USB barcode scanner (keyboard wedge mode)
3. Use "Auto Scanner" tab - just scan bags!
4. System automatically assigns checkpoints

### Batch Operations
1. Get list of bag IDs (from manifest, spreadsheet, etc.)
2. Go to "Batch Scan" tab
3. Paste bag IDs (one per line)
4. Click "Scan X Bag(s)" - process all at once!

## 🎨 UI Features

- Modern, professional design
- Color-coded checkpoint stages
- Real-time toast notifications
- Responsive layout
- Journey progress visualization
- Operational status indicators

## 📊 Checkpoint Stages

1. **CHECKIN** - Initial bag check-in
2. **SECURITY_CHECK** - Security screening
3. **TRANSFER** - Transfer between flights
4. **LOADING** - Loading onto aircraft
5. **LOADED_ONTO_AIRCRAFT** - Confirmed on plane
6. **IN_TRANSIT** - In flight
7. **UNLOADING** - Unloading from aircraft
8. **ARRIVAL** - Arrived at destination
9. **CLAIMED** - Passenger collected bag ✅
10. **LOST** - Bag reported lost ❌
11. **RETURNED_TO_AGENT** - Returned to airline

## 🔧 API Endpoints

### Core Endpoints
- `POST /registerBag` - Register a new bag
- `POST /scanCheckpoint` - Record a checkpoint scan
- `GET /getStatus/{bag_id}` - Get bag status and operational state
- `GET /checkpoints` - List all checkpoint stages

### Automation Endpoints
- `POST /scan/auto` - Automated scanning (for barcode scanners)
- `POST /scan/batch` - Batch scan multiple bags
- `GET /bag/{bag_id}/qr` - Get QR code image
- `POST /scanners` - Register a scanner device
- `GET /scanners` - List all scanners

See [API Documentation](http://localhost:8000/docs) for complete details.

## 🧠 State Derivation System

The system includes an intelligent state interpretation layer that:

- **Derives operational state** from checkpoint history
- **Assesses risk levels** based on time thresholds
- **Detects delays** automatically
- **Shows journey progress** with visual indicators
- **Provides actionable intelligence** similar to real airline systems

See [STATE_DERIVATION_README.md](STATE_DERIVATION_README.md) for details.

## 📁 Project Structure

```
baggage-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── crud.py           # Database operations
│   │   ├── database.py       # Database connection
│   │   ├── state_derivation.py # State interpretation
│   │   └── qrcode_gen.py     # QR code generation
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── components/       # React components
│   │   ├── utils/            # Utility functions
│   │   └── api.js            # API client
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## 🛠️ Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Running Tests
```bash
cd backend
pytest
```

## 📚 Documentation

- [Project Documentation](PROJECT_DOCUMENTATION.md) - Complete technical documentation
- [User Guide](USER_GUIDE.md) - How to use the application
- [Automation Guide](AUTOMATION_GUIDE.md) - Automation features
- [State Derivation](STATE_DERIVATION_README.md) - State interpretation system

## 🚢 Deployment

### Production Build

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `VITE_BACKEND_URL` - Backend API URL (frontend)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React team for the amazing UI library
- PostgreSQL for reliable data storage

---

**Made with ❤️ for efficient baggage tracking**
