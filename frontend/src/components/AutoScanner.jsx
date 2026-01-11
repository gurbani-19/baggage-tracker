import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { api } from '../api'
import { showToast } from '../utils/toast'

export default function AutoScanner({ scannerId, onScanComplete }) {
  const [scanning, setScanning] = useState(false)
  const [scanner, setScanner] = useState(null)
  const [location, setLocation] = useState('')
  const html5QrCodeRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (scannerId) {
      api.getScanner(scannerId).then(setScanner).catch(console.error)
    }
  }, [scannerId])

  useEffect(() => {
    if (scanner) {
      setLocation(scanner.location)
    }
  }, [scanner])

  async function handleScan(bagId) {
    try {
      await api.autoScan(bagId, scannerId, location)
      showToast(`Bag ${bagId} scanned successfully!`, 'success')
      onScanComplete && onScanComplete(bagId)
    } catch (error) {
      showToast(`Error: ${error.message}`, 'error')
    }
  }

  async function startCameraScan() {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader")
      html5QrCodeRef.current = html5QrCode
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScan(decodedText)
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      )
      setScanning(true)
    } catch (err) {
      showToast('Failed to start camera: ' + err.message, 'error')
    }
  }

  function stopCameraScan() {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear()
        setScanning(false)
      }).catch(console.error)
    }
  }

  // Handle barcode scanner input (keyboard wedge mode)
  useEffect(() => {
    let buffer = ''
    let timeout = null

    function handleKeyPress(e) {
      // Barcode scanners typically send data quickly and end with Enter
      if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault()
        handleScan(buffer.trim())
        buffer = ''
      } else if (e.key.length === 1) {
        buffer += e.key
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          buffer = '' // Clear buffer if too slow (not a scanner)
        }, 100)
      }
    }

    if (!scanning) {
      window.addEventListener('keypress', handleKeyPress)
      return () => {
        window.removeEventListener('keypress', handleKeyPress)
        clearTimeout(timeout)
      }
    }
  }, [scanning])

  return (
    <div className="card">
      <h3>Automated Scanner</h3>
      {scanner && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '6px' }}>
          <strong>Scanner:</strong> {scanner.name}<br />
          <strong>Location:</strong> {scanner.location}<br />
          <strong>Checkpoint:</strong> {scanner.checkpoint.replace(/_/g, ' ')}
        </div>
      )}
      
      <label>
        <span>Location Override</span>
        <input 
          value={location} 
          onChange={e => setLocation(e.target.value)}
          placeholder="Optional location override"
        />
      </label>

      <div style={{ marginTop: '1rem' }}>
        {!scanning ? (
          <button onClick={startCameraScan} className="success">
            📷 Start Camera Scan
          </button>
        ) : (
          <button onClick={stopCameraScan} className="danger">
            ⏹️ Stop Camera
          </button>
        )}
      </div>

      {scanning && (
        <div id="qr-reader" style={{ width: '100%', marginTop: '1rem' }}></div>
      )}

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.875rem' }}>
        <strong>Usage:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Connect a barcode scanner (keyboard wedge mode) - just scan!</li>
          <li>Or use camera to scan QR codes</li>
          <li>Checkpoint is automatically determined by scanner location</li>
        </ul>
      </div>
    </div>
  )
}