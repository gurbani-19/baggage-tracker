import { useState, useEffect } from 'react'
import { api } from '../api'
import { showToast } from '../utils/toast'

export default function ScannerManagement() {
  const [scanners, setScanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    location: '',
    checkpoint: '',
    device_type: 'barcode'
  })

  useEffect(() => {
    loadScanners()
  }, [])

  async function loadScanners() {
    try {
      const data = await api.getScanners(false)
      setScanners(data)
    } catch (error) {
      console.error('Failed to load scanners:', error)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createScanner(form)
      showToast('Scanner registered successfully!', 'success')
      setForm({ name: '', location: '', checkpoint: '', device_type: 'barcode' })
      loadScanners()
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>Scanner Management</h3>
      
      <form onSubmit={handleSubmit}>
        <label>
          <span>Scanner Name</span>
          <input
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Security Scanner 1"
          />
        </label>
        
        <label>
          <span>Location</span>
          <input
            required
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="e.g., Terminal 3, Gate A12"
          />
        </label>
        
        <label>
          <span>Default Checkpoint</span>
          <select
            required
            value={form.checkpoint}
            onChange={e => setForm({ ...form, checkpoint: e.target.value })}
          >
            <option value="">Select checkpoint...</option>
            {['CHECKIN', 'SECURITY_CHECK', 'TRANSFER', 'LOADING', 'LOADED_ONTO_AIRCRAFT', 
              'IN_TRANSIT', 'UNLOADING', 'ARRIVAL', 'CLAIMED', 'LOST', 'RETURNED_TO_AGENT'].map(cp => (
              <option key={cp} value={cp}>{cp.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>
        
        <label>
          <span>Device Type</span>
          <select
            value={form.device_type}
            onChange={e => setForm({ ...form, device_type: e.target.value })}
          >
            <option value="barcode">Barcode Scanner</option>
            <option value="qr">QR Code Scanner</option>
            <option value="rfid">RFID Reader</option>
            <option value="manual">Manual Entry</option>
          </select>
        </label>
        
        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Registering…' : 'Register Scanner'}
          </button>
        </div>
      </form>

      {scanners.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Registered Scanners</h4>
          {scanners.map(scanner => (
            <div key={scanner.id} className="status-item" style={{ marginBottom: '0.5rem' }}>
              <div>
                <strong>{scanner.name}</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {scanner.location} • {scanner.checkpoint.replace(/_/g, ' ')}
                  {!scanner.is_active && <span style={{ color: 'var(--danger)' }}> (Inactive)</span>}
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {scanner.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}