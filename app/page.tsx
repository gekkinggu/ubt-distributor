'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if data is already initialized
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'test' }),
      });
      
      // If we get any response, data is initialized
      setInitialized(true);
    } catch (err) {
      // Error is fine, just means we need to check
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    setError('');
    
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInitialized(true);
        alert('Data berhasil diinisialisasi! Silakan login dengan credentials yang tertera.');
      } else {
        setError(data.message || 'Gagal menginisialisasi data');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menginisialisasi data');
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Login gagal');
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/operator');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Uterine Balloon Tamponade</h1>
          <p className="login-subtitle">Sistem Manajemen Distribusi</p>
        </div>

        {!initialized && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
              ⚠️ Inisialisasi Data Diperlukan
            </p>
            <p style={{ fontSize: '0.813rem', marginBottom: '1rem' }}>
              Klik tombol di bawah untuk membuat data sampel (3 mitra dengan 12 produk).
            </p>
            <button 
              onClick={handleInitialize} 
              className="btn btn-primary"
              disabled={initializing}
              style={{ width: '100%' }}
            >
              {initializing ? (
                <>
                  <span className="spinner"></span>
                  Menginisialisasi...
                </>
              ) : (
                'Inisialisasi Data Sampel'
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Masukkan username"
              required
              autoFocus
              disabled={!initialized}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Masukkan password"
              required
              disabled={!initialized}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading || !initialized} 
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-help">
            Default credentials:<br />
            Admin: <strong>admin / admin123</strong><br />
            Operator: <strong>operator / operator123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
