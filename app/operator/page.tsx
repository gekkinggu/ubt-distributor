'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import './operator.css';

interface User {
  id: string;
  username: string;
  role: string;
}

interface ProductData {
  _id: string;
  qrCode: string;
  partnerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  condition: 'terkirim' | 'terpakai' | 'rusak';
  scannedAt?: string;
  scannedBy?: string;
  createdAt: string;
  partner: {
    name: string;
    province: string;
  } | null;
}

export default function OperatorPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState<'none' | 'camera' | 'manual' | 'upload'>('none');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [scanning, setScanning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    verifyAuth();
    
    return () => {
      stopCamera();
    };
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    setLoading(false);
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const startCamera = async () => {
    try {
      setError('');
      setScanMode('camera');
      setScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning
        scanIntervalRef.current = setInterval(() => {
          scanQRFromVideo();
        }, 300);
      }
    } catch (err) {
      setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      setScanMode('none');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    if (scanMode === 'camera') {
      setScanMode('none');
    }
  };

  const scanQRFromVideo = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      stopCamera();
      fetchProductByQR(code.data);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      fetchProductByQR(manualInput.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError('');
    setScanMode('upload');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            fetchProductByQR(code.data);
          } else {
            setError('Tidak dapat membaca QR code dari gambar. Pastikan gambar jelas dan mengandung QR code.');
            setScanMode('none');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const fetchProductByQR = async (qrCode: string) => {
    setError('');
    setSuccess('');
    setProductData(null);
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/products/scan/${encodeURIComponent(qrCode)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProductData(data.data);
        setSuccess('Produk berhasil dipindai!');
        setManualInput('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal memindai produk. Silakan coba lagi.');
    }
  };

  const resetScan = () => {
    setProductData(null);
    setError('');
    setSuccess('');
    setManualInput('');
    setScanMode('none');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateCondition = async (newCondition: string) => {
    if (!productData) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/products/${productData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ condition: newCondition }),
      });

      const data = await response.json();
      if (data.success) {
        setProductData({ ...productData, condition: newCondition as any });
        setSuccess('Kondisi produk berhasil diupdate');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal mengupdate kondisi produk');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}></div>
        <p style={{ marginTop: '1rem' }}>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="operator-container">
      <nav className="operator-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <h1>UBT Operator</h1>
            </div>
            <div className="nav-user">
              <span>Halo, {user?.username}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="operator-main">
        <div className="container">
          <div className="scan-container">
            <h2 className="scan-title">Pindai Produk</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {!productData && scanMode === 'none' && (
              <div className="scan-options">
                <button onClick={startCamera} className="scan-option-btn">
                  <div className="scan-icon">📷</div>
                  <h3>Scan dengan Kamera</h3>
                  <p>Gunakan kamera untuk memindai QR code</p>
                </button>
                
                <button onClick={() => setScanMode('manual')} className="scan-option-btn">
                  <div className="scan-icon">⌨️</div>
                  <h3>Input Manual</h3>
                  <p>Masukkan kode QR secara manual</p>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="scan-option-btn">
                  <div className="scan-icon">📁</div>
                  <h3>Upload Gambar</h3>
                  <p>Pilih file gambar QR code</p>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {scanMode === 'camera' && scanning && (
              <div className="camera-container">
                <video ref={videoRef} className="camera-video" playsInline />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="camera-overlay">
                  <div className="camera-frame"></div>
                  <p className="camera-instruction">Arahkan kamera ke QR code</p>
                </div>
                <button onClick={stopCamera} className="btn btn-danger btn-lg camera-stop">
                  Berhenti
                </button>
              </div>
            )}

            {scanMode === 'manual' && !productData && (
              <div className="manual-container card">
                <form onSubmit={handleManualSubmit}>
                  <div className="form-group">
                    <label htmlFor="qrInput" className="form-label">
                      Masukkan Kode QR
                    </label>
                    <input
                      type="text"
                      id="qrInput"
                      className="form-input"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="UBT-2024-ABC123-001"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={resetScan} className="btn btn-outline">
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Pindai
                    </button>
                  </div>
                </form>
              </div>
            )}

            {productData && (
              <div className="product-result card">
                <div className="result-header">
                  <h3 className="result-title">Informasi Produk</h3>
                  <span className={`badge ${productData.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {productData.status === 'active' ? 'Aktif' : 'Telah Dipindai'}
                  </span>
                </div>
                
                <div className="result-body">
                  <div className="result-item">
                    <span className="result-label">Kode QR:</span>
                    <span className="result-value">{productData.qrCode}</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Mitra:</span>
                    <span className="result-value">{productData.partner?.name || '-'}</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Provinsi:</span>
                    <span className="result-value">{productData.partner?.province || '-'}</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Nomor Batch:</span>
                    <span className="result-value">{productData.batchNumber}</span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Tanggal Produksi:</span>
                    <span className="result-value">
                      {new Date(productData.manufacturingDate).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Tanggal Kadaluarsa:</span>
                    <span className="result-value">
                      {new Date(productData.expiryDate).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="result-item">
                    <span className="result-label">Kondisi:</span>
                    <select
                      className="form-select"
                      value={productData.condition}
                      onChange={(e) => handleUpdateCondition(e.target.value)}
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.5rem',
                        maxWidth: '200px',
                        marginLeft: 'auto'
                      }}
                    >
                      <option value="terkirim">Terkirim</option>
                      <option value="terpakai">Terpakai</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                  
                  {productData.scannedAt && (
                    <div className="result-item">
                      <span className="result-label">Dipindai Pada:</span>
                      <span className="result-value">
                        {new Date(productData.scannedAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="result-footer">
                  <button onClick={resetScan} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Pindai Produk Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
