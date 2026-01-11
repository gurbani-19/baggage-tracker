import { useState } from 'react'
import { api } from '../api'
import { showToast } from '../utils/toast'
import { addStoredBag } from '../utils/storage'
import QRCodeDisplay from './QRCodeDisplay'

export default function BaggageForm({ onRegistered }) {
  const [form, setForm] = useState({ tag_number: '', passenger_name: '', flight_number: '', origin: '', destination: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [registeredBag, setRegisteredBag] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const bag = await api.registerBag(form)
      setForm({ tag_number: '', passenger_name: '', flight_number: '', origin: '', destination: '' })
      setRegisteredBag(bag)
      addStoredBag(bag)
      showToast(`Bag registered successfully! ID: ${bag.id}`, 'success')
      onRegistered && onRegistered(bag)
    } catch (err) {
      const errorMsg = err.message || 'Failed to register bag'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Register Bag</h3>
      <label>
        <span>Tag Number *</span>
        <input 
          required 
          value={form.tag_number} 
          onChange={e => setForm({ ...form, tag_number: e.target.value })} 
          placeholder="Enter bag tag number"
        />
      </label>
      <label>
        <span>Passenger Name</span>
        <input 
          value={form.passenger_name} 
          onChange={e => setForm({ ...form, passenger_name: e.target.value })} 
          placeholder="Enter passenger name"
        />
      </label>
      <label>
        <span>Flight Number</span>
        <input 
          value={form.flight_number} 
          onChange={e => setForm({ ...form, flight_number: e.target.value })} 
          placeholder="e.g., AA123"
        />
      </label>
      <label>
        <span>Origin</span>
        <input 
          value={form.origin} 
          onChange={e => setForm({ ...form, origin: e.target.value })} 
          placeholder="e.g., JFK"
        />
      </label>
      <label>
        <span>Destination</span>
        <input 
          value={form.destination} 
          onChange={e => setForm({ ...form, destination: e.target.value })} 
          placeholder="e.g., LAX"
        />
      </label>
      <div className="actions">
        <button type="submit" disabled={loading}>
          {loading ? <span className="loading"></span> : null}
          {loading ? 'Registering…' : 'Register Bag'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {registeredBag && (
        <div className="success">
          <strong>Bag Registered!</strong>
          <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            ID: {registeredBag.id}
          </div>
          <QRCodeDisplay bagId={registeredBag.id} size={150} />
        </div>
      )}
    </form>
  )
}
