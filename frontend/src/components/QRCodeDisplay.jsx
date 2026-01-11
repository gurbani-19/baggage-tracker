import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeDisplay({ bagId, size = 200 }) {
  if (!bagId) return null

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ 
        display: 'inline-block', 
        padding: '1rem', 
        background: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <QRCodeSVG 
          value={bagId} 
          size={size}
          level="M"
          includeMargin={true}
        />
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
          {bagId}
        </div>
      </div>
    </div>
  )
}