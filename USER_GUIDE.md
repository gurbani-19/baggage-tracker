# 🎒 Baggage Tracker - Complete User Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Manual Entry Tab](#manual-entry-tab)
3. [Auto Scanner Tab](#auto-scanner-tab)
4. [Batch Scan Tab](#batch-scan-tab)
5. [Manage Scanners Tab](#manage-scanners-tab)
6. [Understanding Status & Tracking](#understanding-status--tracking)
7. [How Everything Works Together](#how-everything-works-together)

---

## Overview

The Baggage Tracker has **4 main tabs** for different ways to work with bags:

1. **Manual Entry** - Type everything by hand (good for testing)
2. **Auto Scanner** - Use barcode scanners or camera (for real operations)
3. **Batch Scan** - Process many bags at once (for loading/unloading)
4. **Manage Scanners** - Set up physical scanner devices

---

## Manual Entry Tab

### What It Does
This is the **basic mode** where you manually type in all information.

### How to Use

#### 1. Register a Bag
- Fill in the form:
  - **Tag Number** (required) - The bag's tag/barcode number
  - **Passenger Name** (optional) - Who owns the bag
  - **Flight Number** (optional) - e.g., "AA123"
  - **Origin** (optional) - e.g., "JFK"
  - **Destination** (optional) - e.g., "LAX"
- Click **"Register Bag"**
- You'll see:
  - ✅ Success message
  - The bag's unique ID (save this!)
  - A QR code (for printing labels)

#### 2. Scan a Checkpoint
- Enter the **Bag ID** (from registration)
- Select a **Checkpoint** from dropdown:
  - CHECKIN → SECURITY_CHECK → TRANSFER → LOADING → etc.
- Optionally add:
  - **Location** - Where the scan happened (e.g., "Terminal 3, Gate A12")
  - **Status Note** - Any additional info
- Click **"Record Scan"**

#### 3. View Bag Status
- Enter a **Bag ID**
- Click **"Get Status"**
- You'll see:
  - Bag information
  - Current checkpoint
  - Complete history
  - **Operational Status** (NEW!)
  - **Journey Progress** timeline

---

## Auto Scanner Tab

### What It Does
This is for **real-world operations** with barcode scanners or cameras.

### How It Works

#### Setup First:
1. Go to **"Manage Scanners"** tab
2. Register your scanner (see below)
3. Note the Scanner ID

#### Then Use It:
1. Go to **"Auto Scanner"** tab
2. Select your scanner from dropdown
3. **Two ways to scan:**

   **Option A: USB Barcode Scanner**
   - Connect USB barcode scanner to computer
   - Scanner works like a keyboard
   - Just **scan the bag's barcode** - that's it!
   - System automatically:
     - Detects the bag ID
     - Assigns checkpoint (based on scanner location)
     - Records timestamp
     - Shows success message

   **Option B: Camera QR Code**
   - Click **"Start Camera Scan"**
   - Point camera at QR code
   - System automatically processes

### Why This Is Better
- **6x faster** than manual entry
- **No typing** - just scan
- **Automatic** checkpoint assignment
- **Real-time** processing

---

## Batch Scan Tab

### What It Does
Process **multiple bags at once** - perfect for loading/unloading aircraft.

### How to Use

1. **Get your bag IDs** (from manifest, spreadsheet, etc.)
2. Go to **"Batch Scan"** tab
3. **Paste bag IDs** into the text area:
   ```
   bag-id-1
   bag-id-2
   bag-id-3
   ...
   ```
   (One ID per line)
4. Optionally select a scanner
5. Click **"Scan X Bag(s)"**
6. System processes all bags instantly

### When to Use
- **Loading aircraft**: Scan all bags going on plane
- **Unloading aircraft**: Scan all bags coming off
- **Transfer operations**: Moving bags between flights
- **Bulk operations**: Any time you have many bags

---

## Manage Scanners Tab

### What It Does
Register and manage **physical scanner devices** in your system.

### Why You Need This
Each scanner knows:
- **Where it is** (location)
- **What checkpoint it represents** (default checkpoint)
- **What type it is** (barcode, QR, RFID, manual)

When you scan with a registered scanner, the system automatically knows which checkpoint to assign!

### How to Use

1. Fill in the form:
   - **Scanner Name**: e.g., "Security Scanner 1"
   - **Location**: e.g., "Terminal 3, Gate A12"
   - **Default Checkpoint**: Select the checkpoint this scanner represents
   - **Device Type**: 
     - Barcode Scanner (USB keyboard wedge)
     - QR Code Scanner (camera-based)
     - RFID Reader (for RFID tags)
     - Manual Entry (fallback)
2. Click **"Register Scanner"**
3. **Save the Scanner ID** - you'll need it!

### Example Setup

**Security Checkpoint:**
- Name: "Security Scanner 1"
- Location: "Terminal 3, Security Checkpoint"
- Checkpoint: "SECURITY_CHECK"
- Type: "Barcode Scanner"

**Loading Bay:**
- Name: "Loading Bay Scanner A"
- Location: "Terminal 3, Gate A12, Loading Bay"
- Checkpoint: "LOADING"
- Type: "Barcode Scanner"

Now when you use these scanners, they automatically assign the right checkpoint!

---

## Understanding Status & Tracking

### What You See

When you view a bag's status, you now see **two types of information**:

#### 1. Events (What Happened)
- **Latest Checkpoint**: The most recent scan
- **Tracking History**: Complete list of all scans with timestamps
- These are **facts** - they never change

#### 2. State (What's Happening Now) - NEW!

The system now **interprets** the events to tell you:

**Operational Status Card:**
- **Status Label**: e.g., "On Track - Security Check" or "Delayed at Loading"
- **Risk Level**: 
  - 🟢 **LOW** - Everything on time
  - 🟡 **MEDIUM** - Some delay
  - 🔴 **HIGH** - Significant delay
- **Time Since Last Scan**: How long since last checkpoint

**Journey Progress Timeline:**
Shows all 11 checkpoint stages with visual indicators:

- ✅ **Completed** (green) - Stages that have been scanned
- ● **Current** (blue, highlighted) - Where the bag is right now
- → **Expected Next** (yellow) - Next logical checkpoint
- ○ **Pending** (gray) - Stages not yet reached

### Example

**Bag History:**
1. CHECKIN (10:00 AM)
2. SECURITY_CHECK (10:05 AM)
3. (No scan for 45 minutes...)

**What System Shows:**
- **Current Stage**: SECURITY_CHECK
- **Expected Next**: TRANSFER
- **Status**: "Delayed at Security Check"
- **Risk**: MEDIUM (expected 10 min, actual 45 min)
- **Timeline**: 
  - ✅ Check In
  - ● Security Check (current, delayed)
  - → Transfer (expected next)
  - ○ Loading, etc. (pending)

---

## How Everything Works Together

### Complete Workflow Example

**Scenario: Bag going from JFK to LAX**

1. **Register Bag** (Manual Entry tab)
   - Tag: "ABC123"
   - Passenger: "John Doe"
   - Flight: "AA456"
   - Origin: "JFK"
   - Destination: "LAX"
   - System generates: Bag ID + QR code

2. **Check-in** (Auto Scanner tab)
   - Use "Check-in Scanner 1"
   - Scan bag barcode
   - System records: CHECKIN checkpoint

3. **Security** (Auto Scanner tab)
   - Use "Security Scanner 1"
   - Scan bag barcode
   - System records: SECURITY_CHECK checkpoint

4. **Loading** (Batch Scan tab)
   - Get manifest of 50 bags for flight AA456
   - Paste all bag IDs
   - Select "Loading Bay Scanner A"
   - Click "Scan 50 Bag(s)"
   - All bags recorded instantly!

5. **Check Status** (Manual Entry tab)
   - Enter bag ID
   - See:
     - ✅ Completed: Check In, Security Check
     - ● Current: Loading
     - → Expected: Loaded Onto Aircraft
     - Status: "On Track - Loading"
     - Risk: LOW

6. **Arrival** (Auto Scanner tab)
   - Use "Arrival Scanner 1"
   - Scan bag barcode
   - System records: ARRIVAL checkpoint

7. **Claimed** (Auto Scanner tab)
   - Use "Baggage Claim Scanner 1"
   - Scan bag barcode
   - System records: CLAIMED checkpoint
   - Status changes to: "Journey Completed"

---

## Quick Reference

### When to Use Each Tab

| Tab | When to Use | Speed |
|-----|-------------|-------|
| **Manual Entry** | Testing, small operations, one-off bags | Slow (10-20 bags/min) |
| **Auto Scanner** | Real operations, single bags, field workers | Fast (60-120 bags/min) |
| **Batch Scan** | Loading/unloading, bulk operations | Very Fast (1000+ bags/sec) |
| **Manage Scanners** | Setup, add new scanners | One-time setup |

### Checkpoint Stages (In Order)

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

### Status Colors

- 🟢 **Green** - On track, completed, low risk
- 🔵 **Blue** - Current stage, normal operation
- 🟡 **Yellow** - Expected next, medium risk, delayed
- 🔴 **Red** - High risk, lost, at risk
- ⚪ **Gray** - Pending, not yet reached

---

## Tips & Tricks

1. **Save Bag IDs**: When you register a bag, copy the ID - you'll need it for scanning
2. **Use Scanners**: Much faster than manual entry
3. **Batch Operations**: For loading/unloading, use Batch Scan
4. **Check Status Regularly**: See if bags are delayed
5. **Register Scanners First**: Set up your scanners before operations start

---

## Troubleshooting

**"Checkpoint dropdown is empty"**
- Backend might not be running
- Check if backend is accessible at http://localhost:8000

**"Bag not found" error**
- Make sure you're using the correct Bag ID
- Check if bag was registered successfully

**"Scanner not working"**
- Make sure scanner is in "keyboard wedge" mode
- Check if browser window is focused
- Try scanning in Notepad first to test scanner

**"Status shows delayed but bag is fine"**
- System uses time thresholds - if no scan for a while, it assumes delay
- Just scan the next checkpoint to update status

---

## Summary

- **Manual Entry**: Type everything (good for testing)
- **Auto Scanner**: Use barcode scanners (fast, real operations)
- **Batch Scan**: Process many bags at once (bulk operations)
- **Manage Scanners**: Set up scanner devices (one-time setup)
- **Status View**: See events (what happened) + state (what's happening now)

The system now works like a **real airline baggage system** - even without physical scanners, you can simulate the entire process!
