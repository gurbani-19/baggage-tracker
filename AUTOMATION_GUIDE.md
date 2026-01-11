# 🤖 Baggage Tracker - Automation Guide

## Overview

The Baggage Tracker now includes comprehensive automation features to handle high-volume baggage operations in real-world scenarios. No more manual entry - everything can be automated!

---

## 🎯 Automation Features

### 1. **QR Code Generation & Scanning**
- **Automatic QR Code Generation**: Every bag gets a QR code when registered
- **Camera Scanning**: Use device camera to scan QR codes
- **Print QR Codes**: Generate QR codes for printing labels

### 2. **Barcode Scanner Integration**
- **Keyboard Wedge Mode**: Connect any USB barcode scanner
- **Automatic Detection**: Scans are automatically processed
- **No Configuration Needed**: Works out of the box

### 3. **Automated Checkpoint Assignment**
- **Location-Based**: Scanners automatically assign checkpoints based on location
- **Smart Routing**: System determines next checkpoint automatically
- **Scanner Profiles**: Each scanner knows its default checkpoint

### 4. **Batch Operations**
- **Multiple Bags at Once**: Scan hundreds of bags in seconds
- **Bulk Processing**: Paste bag IDs from spreadsheets
- **Efficient API**: Optimized for high throughput

### 5. **Scanner Device Management**
- **Register Scanners**: Add physical scanner devices to system
- **Location Mapping**: Map scanners to physical locations
- **Checkpoint Assignment**: Assign default checkpoints to scanners

---

## 🚀 How to Use Automation

### **Setup Scanners**

1. **Register a Scanner**:
   - Go to "Manage Scanners" tab
   - Enter scanner name (e.g., "Security Scanner 1")
   - Enter location (e.g., "Terminal 3, Gate A12")
   - Select default checkpoint
   - Click "Register Scanner"
   - **Save the Scanner ID** - you'll need it!

2. **Scanner Types**:
   - **Barcode Scanner**: USB keyboard wedge mode
   - **QR Code Scanner**: Camera-based scanning
   - **RFID Reader**: For RFID tag integration
   - **Manual Entry**: For fallback scenarios

### **Automated Scanning**

#### **Option 1: Barcode Scanner (Recommended for High Volume)**

1. **Connect Scanner**:
   - Plug USB barcode scanner into computer
   - Scanner should work in "keyboard wedge" mode
   - No drivers needed!

2. **Use Auto Scanner**:
   - Go to "Auto Scanner" tab
   - Select your scanner from dropdown
   - **Just scan bags!** The scanner sends data as keyboard input
   - System automatically:
     - Detects the bag ID
     - Assigns checkpoint based on scanner location
     - Records timestamp and location
     - Shows success notification

3. **How It Works**:
   ```
   Scan Bag → Scanner sends bag ID → System detects → Auto-assigns checkpoint → Done!
   ```

#### **Option 2: Camera QR Code Scanning**

1. **Start Camera Scan**:
   - Go to "Auto Scanner" tab
   - Select scanner
   - Click "Start Camera Scan"
   - Point camera at QR code
   - System automatically processes scan

2. **QR Code Display**:
   - When registering a bag, QR code is automatically displayed
   - Can be printed for physical labels
   - Access via: `/bag/{bag_id}/qr` endpoint

#### **Option 3: Batch Scanning**

1. **Prepare Bag IDs**:
   - Get list of bag IDs (from spreadsheet, database, etc.)
   - One ID per line

2. **Batch Scan**:
   - Go to "Batch Scan" tab
   - Paste bag IDs (one per line)
   - Select scanner (optional)
   - Click "Scan X Bag(s)"
   - System processes all bags at once

3. **Use Cases**:
   - Loading aircraft (scan all bags going on plane)
   - Unloading aircraft (scan all bags coming off)
   - Transfer operations (scan bags moving between flights)

---

## 🔌 API Endpoints for External Systems

### **Automated Scan Endpoint**

```http
POST /scan/auto?bag_id={bag_id}&scanner_id={scanner_id}&location={location}
```

**Parameters**:
- `bag_id` (required): Bag UUID from barcode/QR scan
- `scanner_id` (optional): Scanner device ID
- `location` (optional): Override location

**Response**: Checkpoint log entry

**Example**:
```bash
curl "http://localhost:8000/scan/auto?bag_id=abc-123&scanner_id=scanner-1"
```

**How It Works**:
1. System looks up scanner by ID
2. Gets scanner's default checkpoint and location
3. If bag has history, determines next expected checkpoint
4. Creates checkpoint log entry
5. Returns success

### **Batch Scan Endpoint**

```http
POST /scan/batch?bag_ids={id1}&bag_ids={id2}&scanner_id={scanner_id}
```

**Parameters**:
- `bag_ids` (required, multiple): List of bag IDs
- `scanner_id` (optional): Scanner device ID
- `checkpoint` (optional): Override checkpoint
- `location` (optional): Override location

**Response**: Array of checkpoint log entries

**Example**:
```bash
curl "http://localhost:8000/scan/batch?bag_ids=id1&bag_ids=id2&bag_ids=id3&scanner_id=scanner-1"
```

### **QR Code Generation**

```http
GET /bag/{bag_id}/qr
```

**Response**: PNG image of QR code

**Example**:
```bash
curl "http://localhost:8000/bag/abc-123/qr" -o qrcode.png
```

### **Scanner Management**

```http
POST /scanners
GET /scanners
GET /scanners/{scanner_id}
```

---

## 🏭 Real-World Integration Examples

### **Example 1: USB Barcode Scanner at Security Checkpoint**

1. **Hardware Setup**:
   - USB barcode scanner connected to computer
   - Scanner in "keyboard wedge" mode
   - Computer running web app

2. **Software Setup**:
   - Register scanner: "Security Scanner 1" at "Terminal 3, Security"
   - Default checkpoint: "SECURITY_CHECK"
   - Save scanner ID

3. **Operation**:
   - Open "Auto Scanner" tab
   - Select "Security Scanner 1"
   - Workers scan bags as they pass through
   - System automatically records each scan
   - No manual entry needed!

### **Example 2: Loading Bay with Multiple Bags**

1. **Scenario**: Loading 200 bags onto aircraft

2. **Process**:
   - Use "Batch Scan" tab
   - Get bag IDs from manifest (copy/paste)
   - Select "Loading Bay Scanner"
   - Click "Scan 200 Bag(s)"
   - All bags recorded in seconds

3. **Alternative**: Use barcode scanner
   - Rapid-fire scanning
   - Each scan automatically processed
   - Much faster than manual entry

### **Example 3: Mobile App Integration**

1. **Mobile App** (external):
   - Scans QR code
   - Calls API: `POST /scan/auto?bag_id={id}&scanner_id={mobile-scanner-1}`
   - Gets success response
   - Shows confirmation

2. **Backend**:
   - Receives scan request
   - Looks up scanner profile
   - Determines checkpoint
   - Records scan
   - Returns result

### **Example 4: RFID Integration**

1. **Setup**:
   - Register RFID reader as scanner
   - Device type: "rfid"
   - Location: "Baggage Carousel 1"

2. **Operation**:
   - RFID reader detects tags automatically
   - Sends bag IDs to API endpoint
   - System processes automatically
   - No human intervention needed

---

## 📊 Performance & Scalability

### **Throughput**

- **Manual Entry**: ~10-20 bags/minute
- **Barcode Scanner**: ~60-120 bags/minute
- **Batch API**: ~1000+ bags/second (limited by database)

### **Recommended Setup**

**Small Operation** (< 100 bags/day):
- Manual entry or single barcode scanner

**Medium Operation** (100-1000 bags/day):
- Multiple barcode scanners at key checkpoints
- Batch scanning for loading/unloading

**Large Operation** (1000+ bags/day):
- Dedicated scanners at every checkpoint
- Batch API integration
- RFID readers for high-volume areas
- Mobile apps for field workers

---

## 🔧 Technical Details

### **Barcode Scanner (Keyboard Wedge Mode)**

Most USB barcode scanners work in "keyboard wedge" mode:
- Scanner acts like a keyboard
- When you scan, it types the barcode
- Ends with Enter key
- No drivers or configuration needed

**How We Detect It**:
- Listen for rapid keyboard input
- Detect Enter key after input
- Extract bag ID
- Process automatically

### **QR Code Scanning**

Uses `html5-qrcode` library:
- Access device camera
- Real-time QR code detection
- Automatic processing on scan

### **Checkpoint Logic**

1. **If scanner_id provided**:
   - Look up scanner
   - Use scanner's default checkpoint
   - Use scanner's location

2. **If no scanner or checkpoint not set**:
   - Get bag's tracking history
   - Determine next expected checkpoint
   - Use that checkpoint

3. **Fallback**:
   - If no history, use CHECKIN (first stage)

---

## 🎯 Best Practices

1. **Register All Scanners First**:
   - Set up scanner profiles before operations
   - Map physical locations accurately
   - Assign correct default checkpoints

2. **Use Consistent Naming**:
   - Scanner names: "Security 1", "Loading Bay A", etc.
   - Location format: "Terminal X, Gate Y"

3. **Test Before Production**:
   - Test scanner integration
   - Verify checkpoint assignment
   - Check batch operations

4. **Monitor Performance**:
   - Watch for failed scans
   - Check scanner status
   - Review batch operation results

5. **Backup Manual Entry**:
   - Keep manual entry option available
   - For scanner failures or edge cases

---

## 🚨 Troubleshooting

### **Barcode Scanner Not Working**

1. **Check Scanner Mode**:
   - Ensure "keyboard wedge" mode enabled
   - Some scanners have mode switch

2. **Test Scanner**:
   - Open Notepad
   - Scan a barcode
   - Should type the code

3. **Check Browser Focus**:
   - Ensure browser window is focused
   - Auto Scanner tab must be active

### **Camera Not Starting**

1. **Check Permissions**:
   - Browser needs camera permission
   - Grant when prompted

2. **Check HTTPS**:
   - Some browsers require HTTPS for camera
   - Use localhost (always allowed)

3. **Try Different Browser**:
   - Chrome/Edge work best
   - Firefox may have issues

### **Batch Scan Failing**

1. **Check Bag IDs**:
   - Ensure valid UUIDs
   - One per line
   - No extra characters

2. **Check Scanner**:
   - Verify scanner exists
   - Check if active

3. **Check API Limits**:
   - Very large batches may timeout
   - Split into smaller batches (100-200 bags)

---

## 📈 Future Enhancements

- **RFID Auto-Detection**: Automatic scanning without manual trigger
- **Real-time Dashboard**: Live view of all scans
- **Analytics**: Scan rate, bottlenecks, efficiency metrics
- **Mobile Apps**: Native iOS/Android apps
- **Voice Commands**: Voice-activated scanning
- **AI Integration**: Predictive routing, anomaly detection

---

## 🎉 Summary

The automation features transform the Baggage Tracker from a manual system to a production-ready, high-volume operation:

✅ **QR Code Generation** - Print labels automatically  
✅ **Barcode Scanner Support** - Connect USB scanners  
✅ **Camera Scanning** - Use device cameras  
✅ **Automated Checkpoints** - Smart routing  
✅ **Batch Operations** - Process hundreds at once  
✅ **API Integration** - Connect external systems  
✅ **Scanner Management** - Register and manage devices  

**Result**: Handle thousands of bags per day with minimal manual intervention!
