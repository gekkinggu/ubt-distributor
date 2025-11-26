'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const runMigration = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/migrate-to-mongo', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Migration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          marginBottom: '10px',
          color: '#333',
          textAlign: 'center'
        }}>
          🚀 MongoDB Migration
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Transfer data from JSON files to MongoDB Atlas
        </p>

        {!result && !error && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={runMigration}
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                padding: '15px 40px',
                fontSize: '16px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                width: '100%'
              }}
            >
              {loading ? '⏳ Migrating...' : '▶️ Start Migration'}
            </button>
            <p style={{ 
              marginTop: '20px', 
              fontSize: '14px', 
              color: '#999',
              lineHeight: '1.6'
            }}>
              This will:<br/>
              • Clear existing MongoDB data<br/>
              • Transfer users, partners, and products<br/>
              • Map old IDs to new MongoDB IDs
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#c33', marginBottom: '10px' }}>❌ Error</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>{error}</p>
            <button
              onClick={() => setError('')}
              style={{
                background: '#c33',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {result && (
          <div style={{
            background: '#efe',
            border: '1px solid #cfc',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#3c3', marginBottom: '15px' }}>✅ Migration Successful!</h3>
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Users:</strong> {result.summary.users}
              </p>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Partners:</strong> {result.summary.partners}
              </p>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Products:</strong> {result.summary.products}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Go to Login Page →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
