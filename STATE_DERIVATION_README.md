# State Derivation System

## Overview

The Baggage Tracker now includes a **State Interpretation Layer** that derives operational state from checkpoint history. This transforms immutable events (checkpoint scans) into actionable operational intelligence, similar to real airline baggage systems.

## Key Concepts

### Event vs State

- **Event**: An immutable checkpoint scan record stored in the database
  - Example: "Bag ABC123 scanned at SECURITY_CHECK at 10:30 AM"
  - Events are facts - they never change

- **State**: Derived operational phase based on events + time
  - Example: "Bag is currently at Security Check, awaiting Transfer, delayed by 15 minutes"
  - State is computed - it changes as time passes and new events occur

### Why This Matters

Real airline systems don't just show "what happened" - they show:
- **Where the bag is NOW** (current operational phase)
- **What's been completed** (journey progress)
- **What's expected NEXT** (next logical step)
- **Is it on time?** (risk assessment)

This system now provides the same intelligence.

## How It Works

### State Derivation Logic

The `state_derivation.py` module analyzes checkpoint history and derives:

1. **Completed Stages**: All unique checkpoints that have been scanned
2. **Current Stage**: The operational phase the bag is currently in
3. **Expected Next Stage**: The next logical checkpoint in the journey
4. **Operational Status**: High-level status (ON_TRACK, DELAYED, AT_RISK, etc.)
5. **Risk Level**: Assessment of whether bag is on schedule (LOW/MEDIUM/HIGH)
6. **Time Analysis**: Minutes since last scan, delay detection

### Rule-Based Logic

The system uses rule-based logic (no ML) to determine state:

#### Time-Based Assessment

```python
# Expected times between checkpoints (in minutes)
CHECKIN → SECURITY_CHECK: 5 min
SECURITY_CHECK → TRANSFER: 10 min
TRANSFER → LOADING: 15 min
LOADING → LOADED_ONTO_AIRCRAFT: 5 min
# etc.
```

#### Risk Assessment

- **LOW Risk**: Within expected time thresholds
- **MEDIUM Risk**: 2x expected time exceeded
- **HIGH Risk**: 3x expected time exceeded

#### Status Determination

- **ON_TRACK**: Normal progression, within time limits
- **AWAITING_NEXT_STAGE**: At a checkpoint, waiting for next scan
- **IN_TRANSIT**: Currently in flight
- **DELAYED**: Exceeding expected time (medium risk)
- **AT_RISK**: Significantly delayed (high risk)
- **COMPLETED**: Journey finished (CLAIMED)
- **TERMINAL**: Terminal state reached (LOST, RETURNED_TO_AGENT)

### Terminal States

Some checkpoints are "terminal" - no further progression expected:
- `CLAIMED`: Bag collected by passenger
- `LOST`: Bag reported lost
- `RETURNED_TO_AGENT`: Bag returned to airline

When a terminal state is reached, the bag's journey is complete.

## API Response

The existing `GET /getStatus/{bag_id}` endpoint now includes an `operational_state` object:

```json
{
  "bag": { ... },
  "latest_checkpoint": { ... },
  "history": [ ... ],
  "next_stage": "TRANSFER",
  "operational_state": {
    "completed_stages": ["CHECKIN", "SECURITY_CHECK"],
    "current_stage": "SECURITY_CHECK",
    "expected_next_stage": "TRANSFER",
    "operational_status": "AWAITING_NEXT_STAGE",
    "status_label": "Awaiting Security Check",
    "risk_level": "LOW",
    "time_since_last_scan_minutes": 8.5,
    "is_delayed": false,
    "is_terminal": false
  }
}
```

## Frontend Visualization

The frontend now displays:

1. **Operational Status Card**: 
   - Status label (e.g., "On Track - Security Check")
   - Risk level with color coding
   - Time since last scan

2. **Journey Progress Timeline**:
   - ✓ Completed stages (green)
   - ● Current stage (blue, highlighted)
   - → Expected next stage (yellow)
   - ○ Pending stages (gray)

3. **Visual Indicators**:
   - Color-coded risk levels
   - Delay warnings
   - Terminal state indicators

## Example Scenarios

### Scenario 1: Normal Progression

**History**: CHECKIN → SECURITY_CHECK (5 min ago)

**Derived State**:
- Current: SECURITY_CHECK
- Expected Next: TRANSFER
- Status: AWAITING_NEXT_STAGE
- Risk: LOW
- Label: "Awaiting Security Check"

### Scenario 2: Delayed Bag

**History**: CHECKIN → SECURITY_CHECK (45 min ago)

**Derived State**:
- Current: SECURITY_CHECK
- Expected Next: TRANSFER
- Status: DELAYED
- Risk: MEDIUM (expected 10 min, actual 45 min)
- Label: "Delayed at Security Check"

### Scenario 3: In Transit

**History**: ... → LOADED_ONTO_AIRCRAFT → IN_TRANSIT

**Derived State**:
- Current: IN_TRANSIT
- Expected Next: UNLOADING
- Status: IN_TRANSIT
- Risk: LOW (flight duration is variable)
- Label: "In Transit"

### Scenario 4: Completed Journey

**History**: ... → ARRIVAL → CLAIMED

**Derived State**:
- Current: CLAIMED
- Expected Next: null
- Status: COMPLETED
- Risk: LOW
- Label: "Journey Completed"
- Is Terminal: true

## Scanner-Less Simulation

Even without physical scanners, the system behaves like a real airport system:

1. **Manual Scans**: When you manually record a checkpoint scan, the system:
   - Records the event (immutable)
   - Derives new state from updated history
   - Updates risk assessment
   - Shows updated journey progress

2. **Time-Based Updates**: As time passes:
   - Risk levels increase if expected scans don't occur
   - Status changes from "AWAITING" to "DELAYED" to "AT_RISK"
   - System provides actionable intelligence

3. **Real-Time Intelligence**: The state is computed on-demand:
   - Every status request recalculates state
   - Always reflects current time
   - No stale data

## Implementation Details

### No Database Changes

The state derivation is **computed in memory** from existing checkpoint logs:
- No new database tables
- No schema changes
- Pure computation from history

### Backward Compatible

- Existing API contracts unchanged
- New `operational_state` field is optional
- Old clients still work
- New clients get enhanced data

### Performance

- State derivation is fast (O(n) where n = history length)
- Typically < 10ms for bags with full history
- No database queries for state computation
- Cached in API response

## Future Enhancements

Potential improvements (not implemented):
- Machine learning for time predictions
- Historical data analysis for better thresholds
- Real-time alerts for at-risk bags
- Integration with flight schedules
- Predictive routing

## Code Structure

```
backend/app/
├── state_derivation.py    # Core state logic
├── models.py              # Database models (unchanged)
├── schemas.py             # Added OperationalState schema
└── main.py                # Extended getStatus endpoint

frontend/src/components/
└── StatusViewer.jsx       # Enhanced UI with state visualization
```

## Testing

To test the state derivation:

1. Register a bag
2. Scan a few checkpoints
3. View status - see operational state
4. Wait a few minutes
5. Refresh status - see risk level increase if delayed
6. Complete journey - see terminal state

The system now provides airline-grade operational intelligence!
