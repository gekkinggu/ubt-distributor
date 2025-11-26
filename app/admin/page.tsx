'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { INDONESIAN_PROVINCES } from '@/lib/constants';
import './admin.css';

interface User {
  id: string;
  username: string;
  role: string;
}

interface Partner {
  _id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  email: string;
  contactPerson: string;
  active: boolean;
  productCount: number;
  productDetails: Product[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  qrCode: string;
  partnerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  condition: 'terkirim' | 'terpakai' | 'rusak';
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showViewProductsModal, setShowViewProductsModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCodes, setQRCodes] = useState<{ qrCode: string; dataUrl: string }[]>([]);

  const [newPartner, setNewPartner] = useState({
    name: '',
    address: '',
    province: '',
    phone: '',
    email: '',
    contactPerson: '',
  });

  const [productForm, setProductForm] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: 1,
  });

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      router.push('/operator');
      return;
    }

    setUser(userData);
    await fetchPartners(token);
  };

  const fetchPartners = async (token: string) => {
    try {
      const response = await fetch('/api/partners', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPartners(data.data);
      }
    } catch (err) {
      setError('Gagal mengambil data mitra');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newPartner),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Mitra berhasil ditambahkan');
        setShowAddModal(false);
        setNewPartner({ name: '', address: '', province: '', phone: '', email: '', contactPerson: '' });
        await fetchPartners(token!);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal menambahkan mitra');
    }
  };

  const handleEditPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/partners/${selectedPartner._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedPartner.name,
          address: selectedPartner.address,
          province: selectedPartner.province,
          phone: selectedPartner.phone,
          email: selectedPartner.email,
          contactPerson: selectedPartner.contactPerson,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Mitra berhasil diupdate');
        setShowEditModal(false);
        setSelectedPartner(null);
        await fetchPartners(token!);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal mengupdate mitra');
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mitra ini? Semua produk terkait juga akan dihapus.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Mitra berhasil dihapus');
        await fetchPartners(token!);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal menghapus mitra');
    }
  };

  const handleGenerateProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;

    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          partnerId: selectedPartner._id,
          ...productForm,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        
        // Generate QR codes
        const qrPromises = data.data.map(async (product: Product) => {
          const dataUrl = await QRCode.toDataURL(product.qrCode, {
            width: 300,
            margin: 2,
          });
          return { qrCode: product.qrCode, dataUrl };
        });
        
        const generatedQRs = await Promise.all(qrPromises);
        setQRCodes(generatedQRs);
        
        setShowProductModal(false);
        setShowQRModal(true);
        setProductForm({
          batchNumber: '',
          manufacturingDate: '',
          expiryDate: '',
          quantity: 1,
        });
        await fetchPartners(token!);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal membuat produk');
    }
  };

  const downloadQRCodes = () => {
    qrCodes.forEach((qr, index) => {
      const link = document.createElement('a');
      link.download = `QR-${qr.qrCode}.png`;
      link.href = qr.dataUrl;
      link.click();
    });
  };

  const downloadSingleQR = async (qrCode: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(qrCode, {
        width: 300,
        margin: 2,
      });
      
      const link = document.createElement('a');
      link.download = `QR-${qrCode}.png`;
      link.href = dataUrl;
      link.click();
      
      setSuccess('QR code berhasil didownload');
    } catch (err) {
      setError('Gagal mendownload QR code');
    }
  };

  const handleUpdateCondition = async (productId: string, newCondition: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ condition: newCondition }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Kondisi produk berhasil diupdate');
        await fetchPartners(token!);
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
    <div className="admin-container">
      <nav className="admin-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <h1>UBT Admin</h1>
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

      <main className="admin-main">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="admin-header">
            <h2 className="admin-title">Manajemen Mitra</h2>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              + Tambah Mitra
            </button>
          </div>

          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Mitra</th>
                    <th>Alamat</th>
                    <th>Provinsi</th>
                    <th>Kontak</th>
                    <th>Jumlah Produk</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                        Belum ada data mitra
                      </td>
                    </tr>
                  ) : (
                    partners.map((partner) => (
                      <tr key={partner._id}>
                        <td>
                          <strong>{partner.name}</strong>
                          <br />
                          <small style={{ color: '#666' }}>{partner.contactPerson}</small>
                        </td>
                        <td style={{ fontSize: '0.875rem', maxWidth: '200px' }}>{partner.address}</td>
                        <td>{partner.province}</td>
                        <td style={{ fontSize: '0.875rem' }}>
                          <div>{partner.phone}</div>
                          <div style={{ color: '#666' }}>{partner.email}</div>
                        </td>
                        <td>{partner.productCount}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                setShowViewProductsModal(true);
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              Lihat Produk
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                setShowProductModal(true);
                              }}
                              className="btn btn-success btn-sm"
                            >
                              Generate QR
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                setShowEditModal(true);
                              }}
                              className="btn btn-outline btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePartner(partner._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tambah Mitra Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleAddPartner}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Nama Mitra</label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address" className="form-label">Alamat Lengkap</label>
                  <textarea
                    id="address"
                    className="form-input"
                    value={newPartner.address}
                    onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="province" className="form-label">Provinsi</label>
                  <select
                    id="province"
                    className="form-select"
                    value={newPartner.province}
                    onChange={(e) => setNewPartner({ ...newPartner, province: e.target.value })}
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {INDONESIAN_PROVINCES.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Nomor Telepon</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    placeholder="021-1234567"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    placeholder="info@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactPerson" className="form-label">Nama Kontak Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    className="form-input"
                    value={newPartner.contactPerson}
                    onChange={(e) => setNewPartner({ ...newPartner, contactPerson: e.target.value })}
                    placeholder="Dr. Nama Lengkap"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {showEditModal && selectedPartner && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Mitra</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleEditPartner}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">Nama Mitra</label>
                  <input
                    type="text"
                    id="edit-name"
                    className="form-input"
                    value={selectedPartner.name}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-address" className="form-label">Alamat Lengkap</label>
                  <textarea
                    id="edit-address"
                    className="form-input"
                    value={selectedPartner.address}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-province" className="form-label">Provinsi</label>
                  <select
                    id="edit-province"
                    className="form-select"
                    value={selectedPartner.province}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, province: e.target.value })}
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {INDONESIAN_PROVINCES.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-phone" className="form-label">Nomor Telepon</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    className="form-input"
                    value={selectedPartner.phone}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="edit-email"
                    className="form-input"
                    value={selectedPartner.email}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-contactPerson" className="form-label">Nama Kontak Person</label>
                  <input
                    type="text"
                    id="edit-contactPerson"
                    className="form-input"
                    value={selectedPartner.contactPerson}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, contactPerson: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Products Modal */}
      {showProductModal && selectedPartner && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Produk untuk {selectedPartner.name}</h3>
              <button onClick={() => setShowProductModal(false)} className="modal-close">×</button>
            </div>
            <form onSubmit={handleGenerateProducts}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="batch" className="form-label">Nomor Batch</label>
                  <input
                    type="text"
                    id="batch"
                    className="form-input"
                    value={productForm.batchNumber}
                    onChange={(e) => setProductForm({ ...productForm, batchNumber: e.target.value })}
                    placeholder="BATCH-2024-001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mfg" className="form-label">Tanggal Produksi</label>
                  <input
                    type="date"
                    id="mfg"
                    className="form-input"
                    value={productForm.manufacturingDate}
                    onChange={(e) => setProductForm({ ...productForm, manufacturingDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="exp" className="form-label">Tanggal Kadaluarsa</label>
                  <input
                    type="date"
                    id="exp"
                    className="form-input"
                    value={productForm.expiryDate}
                    onChange={(e) => setProductForm({ ...productForm, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="qty" className="form-label">Jumlah</label>
                  <input
                    type="number"
                    id="qty"
                    className="form-input"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-success">
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Codes Modal */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">QR Code yang Dibuat ({qrCodes.length})</h3>
              <button onClick={() => setShowQRModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="qr-grid">
                {qrCodes.map((qr, index) => (
                  <div key={index} className="qr-item">
                    <img src={qr.dataUrl} alt={qr.qrCode} />
                    <p className="qr-code-text">{qr.qrCode}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={downloadQRCodes} className="btn btn-primary">
                Download Semua
              </button>
              <button type="button" onClick={() => setShowQRModal(false)} className="btn btn-outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Products Modal */}
      {showViewProductsModal && selectedPartner && (
        <div className="modal-overlay" onClick={() => setShowViewProductsModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Produk - {selectedPartner.name} ({selectedPartner.productDetails?.length || 0})
              </h3>
              <button onClick={() => setShowViewProductsModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              {selectedPartner.productDetails && selectedPartner.productDetails.length > 0 ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>QR Code</th>
                        <th>Batch</th>
                        <th>Tgl Produksi</th>
                        <th>Tgl Kadaluarsa</th>
                        <th>Status</th>
                        <th>Kondisi</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPartner.productDetails.map((product) => (
                        <tr key={product._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {product.qrCode}
                          </td>
                          <td>{product.batchNumber}</td>
                          <td>{new Date(product.manufacturingDate).toLocaleDateString('id-ID')}</td>
                          <td>{new Date(product.expiryDate).toLocaleDateString('id-ID')}</td>
                          <td>
                            <span className={`badge ${
                              product.status === 'active' ? 'badge-success' : 
                              product.status === 'scanned' ? 'badge-info' : 'badge-danger'
                            }`}>
                              {product.status === 'active' ? 'Aktif' : 
                               product.status === 'scanned' ? 'Dipindai' : 'Recalled'}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={product.condition}
                              onChange={(e) => handleUpdateCondition(product._id, e.target.value)}
                              style={{ fontSize: '0.813rem', padding: '0.375rem 0.5rem' }}
                            >
                              <option value="terkirim">Terkirim</option>
                              <option value="terpakai">Terpakai</option>
                              <option value="rusak">Rusak</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => downloadSingleQR(product.qrCode)}
                              className="btn btn-sm btn-outline"
                              title="Download QR Code"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              📥 QR
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  Belum ada produk untuk mitra ini.
                  <br />
                  <br />
                  <button
                    onClick={() => {
                      setShowViewProductsModal(false);
                      setShowProductModal(true);
                    }}
                    className="btn btn-success"
                  >
                    Generate Produk Baru
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowViewProductsModal(false)} className="btn btn-outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
