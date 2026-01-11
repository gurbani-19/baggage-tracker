import { useState, useEffect } from 'react'
import { api } from '../api'
import { showToast, copyToClipboard } from '../utils/toast'
import { getStoredBags } from '../utils/storage'

export default function ScanForm({ checkpoints }) {
  const [form, setForm] = useState({ bag_id: '', checkpoint: '', location: '', status_note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showBagList, setShowBagList] = useState(false)
  const storedBags = getStoredBags()

  useEffect(() => {
    if (checkpoints?.length) {
      setForm(f => ({ ...f, checkpoint: f.checkpoint || checkpoints[0] }))
    }
  }, [checkpoints])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.scanCheckpoint(form)
      showToast('Checkpoint scan recorded successfully!', 'success')
      setForm({ ...form, location: '', status_note: '' })
    } catch (err) {
      const errorMsg = err.message || 'Failed to record scan'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleBagSelect(bagId) {
    setForm({ ...form, bag_id: bagId })
    setShowBagList(false)
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Scan Checkpoint</h3>
      <label>
        <span>Bag ID *</span>
        <div className="bag-id-input-group">
          <input 
            required 
            value={form.bag_id} 
            onChange={e => setForm({ ...form, bag_id: e.target.value })} 
            placeholder="Enter or select bag ID"
            onFocus={() => setShowBagList(storedBags.length > 0)}
          />
          {form.bag_id && (
            <button 
              type="button" 
              className="copy-button" 
              onClick={() => copyToClipboard(form.bag_id)}
              title="Copy Bag ID"
            >
              📋
            </button>
          )}
        </div>
        {showBagList && storedBags.length > 0 && (
          <div className="bag-list">
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
      </label>
      <label>
        <span>Checkpoint *</span>
        <select 
          required 
          value={form.checkpoint} 
          onChange={e => setForm({ ...form, checkpoint: e.target.value })}
        >
          {checkpoints && checkpoints.length > 0 ? (
            checkpoints.map(c => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))
          ) : (
            <option value="">Loading checkpoints...</option>
          )}
        </select>
      </label>
      <label>
        <span>Location</span>
        <input 
          value={form.location} 
          onChange={e => setForm({ ...form, location: e.target.value })} 
          placeholder="e.g., Terminal 3, Gate A12"
        />
      </label>
      <label>
        <span>Status Note</span>
        <textarea 
          value={form.status_note} 
          onChange={e => setForm({ ...form, status_note: e.target.value })} 
          placeholder="Additional notes or observations"
          rows="3"
        />
      </label>
      <div className="actions">
        <button type="submit" disabled={loading || !checkpoints?.length}>
          {loading ? <span className="loading"></span> : null}
          {loading ? 'Recording…' : 'Record Scan'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
