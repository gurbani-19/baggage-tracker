import { useEffect, useState } from 'react'
import './App.css'
import { api } from './api'
import BaggageForm from './components/BaggageForm'
import ScanForm from './components/ScanForm'
import StatusViewer from './components/StatusViewer'
import AutoScanner from './components/AutoScanner'
import BatchScanner from './components/BatchScanner'
import ScannerManagement from './components/ScannerManagement'
import { showToast } from './utils/toast'

function App() {
  const [checkpoints, setCheckpoints] = useState([])
  const [lastRegistered, setLastRegistered] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCheckpoints() {
      try {
        const data = await api.getCheckpoints()
        setCheckpoints(data)
      } catch (error) {
        console.error('Failed to load checkpoints:', error)
        showToast('Failed to load checkpoints. Please check if the backend is running.', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadCheckpoints()
  }, [])

  const [selectedScanner, setSelectedScanner] = useState(null)
  const [scanners, setScanners] = useState([])
  const [activeTab, setActiveTab] = useState('manual') // 'manual', 'auto', 'batch', 'scanners'

  useEffect(() => {
    api.getScanners().then(setScanners).catch(console.error)
  }, [])

  return (
    <div className="app">
      <header>
        <h1>✈️ Baggage Tracker</h1>
        <p className="subtitle">Professional baggage tracking and management system with automation</p>
      </header>
      
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={activeTab === 'manual' ? '' : 'secondary'}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </button>
        <button 
          className={activeTab === 'auto' ? '' : 'secondary'}
          onClick={() => setActiveTab('auto')}
        >
          Auto Scanner
        </button>
        <button 
          className={activeTab === 'batch' ? '' : 'secondary'}
          onClick={() => setActiveTab('batch')}
        >
          Batch Scan
        </button>
        <button 
          className={activeTab === 'scanners' ? '' : 'secondary'}
          onClick={() => setActiveTab('scanners')}
        >
          Manage Scanners
        </button>
      </div>

      <main>
        {activeTab === 'manual' && (
          <>
        <div className="col">
          <BaggageForm onRegistered={bag => setLastRegistered(bag)} />
          <ScanForm checkpoints={checkpoints} />
        </div>
        <div className="col">
          <StatusViewer initialBag={lastRegistered} />
        </div>
          </>
        )}
        
        {activeTab === 'auto' && (
          <div className="col" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <label>
              <span>Select Scanner</span>
              <select 
                value={selectedScanner || ''} 
                onChange={e => setSelectedScanner(e.target.value)}
              >
                <option value="">Select a scanner...</option>
                {scanners.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.location}</option>
                ))}
              </select>
            </label>
            {selectedScanner && (
              <AutoScanner 
                scannerId={selectedScanner} 
                onScanComplete={() => {
                  // Refresh or show success
                }}
              />
            )}
          </div>
        )}
        
        {activeTab === 'batch' && (
          <div className="col" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <label>
              <span>Select Scanner (Optional)</span>
              <select 
                value={selectedScanner || ''} 
                onChange={e => setSelectedScanner(e.target.value)}
              >
                <option value="">No scanner (manual checkpoint)</option>
                {scanners.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.location}</option>
                ))}
              </select>
            </label>
            <BatchScanner scannerId={selectedScanner} />
          </div>
        )}
        
        {activeTab === 'scanners' && (
          <div className="col" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <ScannerManagement />
          </div>
        )}
      </main>
      
      <footer className="footer">
        <small>
          Backend API: <code>http://localhost:8000</code> | 
          Set <code>VITE_BACKEND_URL</code> environment variable to override
        </small>
      </footer>
    </div>
  )
}

export default App
