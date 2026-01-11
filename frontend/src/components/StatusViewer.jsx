import { useState, useEffect } from 'react'
import { api } from '../api'
import { showToast, copyToClipboard } from '../utils/toast'
import { getStoredBags } from '../utils/storage'

export default function StatusViewer({ initialBag }) {
  const [bagId, setBagId] = useState(initialBag?.id || '')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showBagList, setShowBagList] = useState(false)
  const storedBags = getStoredBags()

  useEffect(() => {
    if (initialBag?.id) {
      setBagId(initialBag.id)
      fetchStatus(null, initialBag.id)
    }
  }, [initialBag])

  async function fetchStatus(e, id = null) {
    e?.preventDefault()
    const targetId = id || bagId
    if (!targetId) {
      showToast('Please enter a bag ID', 'error')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const s = await api.getStatus(targetId)
      setStatus(s)
      showToast('Status loaded successfully', 'success')
    } catch (err) {
      const errorMsg = err.message || 'Failed to load status'
      setError(errorMsg)
      setStatus(null)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleBagSelect(bagId) {
    setBagId(bagId)
    setShowBagList(false)
    fetchStatus(null, bagId)
  }

  function getCheckpointColor(checkpoint) {
    const colors = {
      'CHECKIN': '#3b82f6',
      'SECURITY_CHECK': '#f59e0b',
      'TRANSFER': '#8b5cf6',
      'LOADING': '#10b981',
      'LOADED_ONTO_AIRCRAFT': '#10b981',
      'IN_TRANSIT': '#6366f1',
      'UNLOADING': '#f59e0b',
      'ARRIVAL': '#10b981',
      'CLAIMED': '#10b981',
      'LOST': '#ef4444',
      'RETURNED_TO_AGENT': '#f59e0b'
    }
    return colors[checkpoint] || '#64748b'
  }

  function getRiskColor(riskLevel) {
    const colors = {
      'LOW': '#10b981',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444'
    }
    return colors[riskLevel] || '#64748b'
  }

  function getStatusColor(operationalStatus) {
    const colors = {
      'ON_TRACK': '#10b981',
      'IN_TRANSIT': '#6366f1',
      'AWAITING_NEXT_STAGE': '#3b82f6',
      'DELAYED': '#f59e0b',
      'AT_RISK': '#ef4444',
      'COMPLETED': '#10b981',
      'TERMINAL': '#64748b'
    }
    return colors[operationalStatus] || '#64748b'
  }

  function getAllStages() {
    return [
      'CHECKIN', 'SECURITY_CHECK', 'TRANSFER', 'LOADING',
      'LOADED_ONTO_AIRCRAFT', 'IN_TRANSIT', 'UNLOADING',
      'ARRIVAL', 'CLAIMED', 'LOST', 'RETURNED_TO_AGENT'
    ]
  }

  return (
    <div className="card">
      <h3>Bag Status & Tracking</h3>
      <form onSubmit={fetchStatus} className="inline">
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            placeholder="Enter bag ID" 
            value={bagId} 
            onChange={e => setBagId(e.target.value)}
            onFocus={() => setShowBagList(storedBags.length > 0)}
          />
          {showBagList && storedBags.length > 0 && (
            <div className="bag-list" style={{ position: 'absolute', zIndex: 10, width: '100%', maxWidth: '400px' }}>
              {storedBags.map(bag => (
                <div 
                  key={bag.id} 
                  className="bag-item"
                  onClick={() => handleBagSelect(bag.id)}
                >
                  <div className="bag-item-info">
                    <div className="bag-item-id">{bag.id}</div>
                    {bag.tag_number && (
                      <div className="bag-item-tag">Tag: {bag.tag_number}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="copy-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(bag.id)
                    }}
                    title="Copy"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading || !bagId}>
          {loading ? <span className="loading"></span> : null}
          {loading ? 'Loading…' : 'Get Status'}
        </button>
        {bagId && (
          <button 
            type="button" 
            className="copy-button" 
            onClick={() => copyToClipboard(bagId)}
            title="Copy Bag ID"
          >
            📋 Copy ID
          </button>
        )}
      </form>
      {error && <p className="error">{error}</p>}
      {status && (
        <div className="status">
          <h4>Bag Information</h4>
          <div className="status-item">
            <strong>Tag Number:</strong>
            <span>{status.bag.tag_number}</span>
          </div>
          {status.bag.passenger_name && (
            <div className="status-item">
              <strong>Passenger:</strong>
              <span>{status.bag.passenger_name}</span>
            </div>
          )}
          {status.bag.flight_number && (
            <div className="status-item">
              <strong>Flight:</strong>
              <span>{status.bag.flight_number}</span>
            </div>
          )}
          {status.bag.origin && (
            <div className="status-item">
              <strong>Origin:</strong>
              <span>{status.bag.origin}</span>
            </div>
          )}
          {status.bag.destination && (
            <div className="status-item">
              <strong>Destination:</strong>
              <span>{status.bag.destination}</span>
            </div>
          )}
          
          <h4>Current Status</h4>
          {status.latest_checkpoint ? (
            <div className="status-item" style={{ borderLeft: `4px solid ${getCheckpointColor(status.latest_checkpoint.checkpoint)}` }}>
            <div>
                <strong style={{ color: getCheckpointColor(status.latest_checkpoint.checkpoint) }}>
                  {status.latest_checkpoint.checkpoint.replace(/_/g, ' ')}
                </strong>
                {status.latest_checkpoint.location && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    📍 {status.latest_checkpoint.location}
                  </div>
                )}
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  🕐 {new Date(status.latest_checkpoint.scanned_at).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p>No checkpoint recorded yet</p>
            </div>
          )}
          
          {/* Operational State Visualization */}
          {status.operational_state && (
            <>
              <h4>Operational Status</h4>
              <div 
                className="status-item" 
                style={{ 
                  background: status.operational_state.is_delayed ? '#fef2f2' : '#f0fdf4',
                  borderLeft: `4px solid ${getStatusColor(status.operational_state.operational_status)}`,
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <strong style={{ 
                    color: getStatusColor(status.operational_state.operational_status),
                    fontSize: '1.1rem'
                  }}>
                    {status.operational_state.status_label}
                  </strong>
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.875rem',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <span>
                      <strong>Risk:</strong> 
                      <span style={{ 
                        color: getRiskColor(status.operational_state.risk_level),
                        marginLeft: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {status.operational_state.risk_level}
                      </span>
                    </span>
                    {status.operational_state.time_since_last_scan_minutes !== null && (
                      <span>
                        <strong>Last Scan:</strong> 
                        <span style={{ marginLeft: '0.5rem' }}>
                          {Math.round(status.operational_state.time_since_last_scan_minutes)} min ago
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <h4>Journey Progress</h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {getAllStages().map((stage, index) => {
                  const isCompleted = status.operational_state.completed_stages.includes(stage)
                  const isCurrent = status.operational_state.current_stage === stage
                  const isExpected = status.operational_state.expected_next_stage === stage
                  const isTerminal = status.operational_state.is_terminal && isCurrent
                  
                  let bgColor = '#f8fafc'
                  let borderColor = '#e2e8f0'
                  let label = ''
                  
                  if (isCompleted && !isCurrent) {
                    bgColor = '#d1fae5'
                    borderColor = '#10b981'
                    label = '✓ Completed'
                  } else if (isCurrent) {
                    bgColor = '#dbeafe'
                    borderColor = getCheckpointColor(stage)
                    label = isTerminal ? '● Terminal' : '● Current'
                  } else if (isExpected) {
                    bgColor = '#fef3c7'
                    borderColor = '#f59e0b'
                    label = '→ Expected Next'
                  } else {
                    bgColor = '#f1f5f9'
                    borderColor = '#cbd5e1'
                    label = '○ Pending'
                  }
                  
                  return (
                    <div
                      key={stage}
                      style={{
                        padding: '0.75rem',
                        background: bgColor,
                        borderLeft: `4px solid ${borderColor}`,
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ 
                        fontWeight: isCurrent ? '600' : '400',
                        color: isCurrent ? getCheckpointColor(stage) : 'var(--text)'
                      }}>
                        {stage.replace(/_/g, ' ')}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontWeight: '500'
                      }}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {status.next_stage && !status.operational_state && (
            <>
              <h4>Next Expected Stage</h4>
              <div className="status-item" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
                <strong style={{ color: '#3b82f6' }}>
                  {status.next_stage.replace(/_/g, ' ')}
                </strong>
              </div>
            </>
          )}
          
          <h4>Tracking History</h4>
          {status.history && status.history.length > 0 ? (
            <ul className="history-list">
              {status.history.map((h, index) => (
                <li key={h.id} className="history-item" style={{ borderLeftColor: getCheckpointColor(h.checkpoint) }}>
                  <div className="history-checkpoint" style={{ color: getCheckpointColor(h.checkpoint) }}>
                    {index + 1}. {h.checkpoint.replace(/_/g, ' ')}
                  </div>
                  <div className="history-details">
                    {h.location && <span>📍 {h.location}</span>}
                    <span>🕐 {new Date(h.scanned_at).toLocaleString()}</span>
                    {h.status_note && <span>📝 {h.status_note}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No tracking history available</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
