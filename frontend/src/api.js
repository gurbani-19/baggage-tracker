const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText} - ${text}`)
  }
  return res.json().catch(() => null)
}

export const api = {
  getCheckpoints: () => request('/checkpoints'),
  registerBag: (payload) => request('/registerBag', { method: 'POST', body: JSON.stringify(payload) }),
  scanCheckpoint: (payload) => request('/scanCheckpoint', { method: 'POST', body: JSON.stringify(payload) }),
  getStatus: (bagId) => request(`/getStatus/${encodeURIComponent(bagId)}`),
  // Automation endpoints
  getBagQRCode: (bagId) => `${BASE}/bag/${encodeURIComponent(bagId)}/qr`,
  autoScan: (bagId, scannerId, location) => {
    const params = new URLSearchParams({ bag_id: bagId });
    if (scannerId) params.append('scanner_id', scannerId);
    if (location) params.append('location', location);
    return request(`/scan/auto?${params.toString()}`, { method: 'POST' });
  },
  batchScan: (bagIds, scannerId, checkpoint, location) => {
    const params = new URLSearchParams();
    bagIds.forEach(id => params.append('bag_ids', id));
    if (scannerId) params.append('scanner_id', scannerId);
    if (checkpoint) params.append('checkpoint', checkpoint);
    if (location) params.append('location', location);
    return request(`/scan/batch?${params.toString()}`, { method: 'POST' });
  },
  createScanner: (payload) => request('/scanners', { method: 'POST', body: JSON.stringify(payload) }),
  getScanners: (activeOnly = true) => request(`/scanners?active_only=${activeOnly}`),
  getScanner: (scannerId) => request(`/scanners/${encodeURIComponent(scannerId)}`),
}

export default api
