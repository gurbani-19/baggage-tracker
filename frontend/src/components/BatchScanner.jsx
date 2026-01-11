import { useState } from 'react'
import { api } from '../api'
import { showToast } from '../utils/toast'

export default function BatchScanner({ scannerId }) {
  const [bagIds, setBagIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  async function handleBatchScan() {
    const ids = bagIds.split('\n').map(id => id.trim()).filter(id => id.length > 0)
    if (ids.length === 0) {
      showToast('Please enter at least one bag ID', 'error')
      return
    }

    setLoading(true)
    setResults(null)
    try {
      const result = await api.batchScan(ids, scannerId, null, null)
      setResults(result)
      showToast(`Successfully scanned ${result.length} bag(s)`, 'success')
      setBagIds('')
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>Batch Scanner</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Scan multiple bags at once. Enter one bag ID per line.
      </p>
      
      <label>
        <span>Bag IDs (one per line)</span>
        <textarea
          value={bagIds}
          onChange={e => setBagIds(e.target.value)}
          placeholder="Enter bag IDs, one per line&#10;Or paste from clipboard"
          rows="10"
          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
      </label>

      <div className="actions">
        <button onClick={handleBatchScan} disabled={loading || !bagIds.trim()}>
          {loading ? <span className="loading"></span> : null}
          {loading ? 'Scanning…' : `Scan ${bagIds.split('\n').filter(id => id.trim()).length} Bag(s)`}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#d1fae5', borderRadius: '6px' }}>
          <strong>Successfully scanned {results.length} bag(s):</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            {results.map((r, i) => (
              <li key={i} style={{ fontSize: '0.875rem' }}>
                {r.bag_id} - {r.checkpoint.replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}