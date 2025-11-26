# Setup Guide - UBT Distributor

## Quick Start (5 menit)

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server
```bash
npm run dev
```

### 3. Buka Browser
```
http://localhost:3000
```

### 4. Klik "Inisialisasi Data Sampel"
Pada halaman login, klik tombol biru untuk membuat:
- 2 user accounts (admin & operator)
- 3 mitra (RS Cipto, RS Sardjito, RS Hasan Sadikin)
- 12 produk dengan QR codes

### 5. Login
**Admin:**
- Username: `admin`
- Password: `admin123`

**Operator:**
- Username: `operator`
- Password: `operator123`

## Testing Features

### Admin Features
1. **View Partners**: Lihat semua mitra di tabel
2. **Add Partner**: 
   - Klik "Tambah Mitra"
   - Isi nama dan pilih provinsi
   - Klik "Tambah"
3. **Edit Partner**: Klik "Edit" pada row mitra
4. **Delete Partner**: Klik "Hapus" (akan menghapus semua produk terkait)
5. **Generate QR Codes**:
   - Klik "Generate QR" pada mitra
   - Isi batch number, tanggal produksi & kadaluarsa
   - Set jumlah (1-100)
   - Klik "Generate"
   - Download QR codes

### Operator Features
1. **Scan dengan Kamera**:
   - Klik "Scan dengan Kamera"
   - Izinkan akses kamera
   - Arahkan ke QR code
   - Otomatis scan dan tampilkan data

2. **Input Manual**:
   - Klik "Input Manual"
   - Copy salah satu QR code dari admin (contoh: UBT-2024-ABC123-001)
   - Paste dan klik "Pindai"

3. **Upload Gambar**:
   - Download QR code dari admin dashboard
   - Klik "Upload Gambar"
   - Pilih file
   - Lihat hasil scan

## File Structure

```
versi3/
├── app/
│   ├── page.tsx          → Login page
│   ├── admin/            → Admin dashboard
│   ├── operator/         → Operator dashboard
│   └── api/              → Backend API routes
├── lib/                  → Utilities & Database
├── types/                → TypeScript types
├── data/                 → JSON database (auto-created)
└── README.md
```

## Database Location

Data disimpan di:
```
versi3/data/
├── users.json      → User accounts
├── partners.json   → Mitra data
└── products.json   → Products & QR codes
```

## Common Issues

### 1. "Token tidak ditemukan"
**Solution**: Logout dan login ulang

### 2. "Gagal mengakses kamera"
**Solution**: 
- Pastikan browser memiliki permission untuk kamera
- Gunakan HTTPS di production (localhost OK untuk development)
- Try different browser

### 3. Port 3000 already in use
**Solution**:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Atau gunakan port lain
npm run dev -- -p 3001
```

### 4. Module not found errors
**Solution**:
```bash
# Delete node_modules dan reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
- Go to vercel.com
- Import your repository
- Add environment variables:
  - `JWT_SECRET`: your-secure-random-string
- Deploy!

3. **MongoDB Migration (Optional)**
- Create MongoDB Atlas account
- Get connection string
- Add `MONGODB_URI` environment variable
- Update `lib/db.ts` to use MongoDB

### Environment Variables (Production)

```env
JWT_SECRET=your-very-secure-random-string-here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ubt-distributor
```

## Development Tips

### Hot Reload
Next.js automatically reloads when you save files.

### API Testing
Use Postman or curl:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Partners (need token)
curl http://localhost:3000/api/partners \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Reset
Hapus folder `data/` dan reload page untuk reinitialize.

## Next Steps

1. ✅ Test semua features
2. ✅ Customize styling (edit CSS files)
3. ✅ Add more partners & products
4. 📝 Plan MongoDB migration
5. 🚀 Deploy to production

## Support

Jika ada masalah:
1. Check browser console (F12)
2. Check terminal output
3. Check file `data/*.json` untuk melihat data
4. Restart dev server

---

**Happy Coding! 🎉**
