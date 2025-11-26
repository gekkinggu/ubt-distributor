# UBT Distributor - Sistem Manajemen Distribusi

Sistem manajemen distribusi untuk produk Uterine Balloon Tamponade (UBT) dengan fitur manajemen mitra, generate QR code, dan scanning QR code.

## 🚀 Fitur

### Admin Dashboard
- **Manajemen Mitra**: Tambah, edit, hapus data mitra distributor
- **Generate QR Code**: Buat QR code produk dalam batch dengan UUID unik
- **Tracking Produk**: Monitor semua produk yang telah dikirim ke mitra
- **Download QR Codes**: Download semua QR code yang dibuat

### Operator Dashboard
- **Scan QR Code**: 3 metode scanning
  - 📷 Scan dengan kamera device
  - ⌨️ Input manual kode QR
  - 📁 Upload gambar QR code
- **Informasi Produk**: Lihat detail lengkap produk (batch, tanggal produksi, kadaluarsa, mitra, dll)
- **Status Tracking**: Otomatis mark produk sebagai "scanned"

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: JWT + bcrypt
- **QR Code**: qrcode (generate) + jsQR (scan)
- **Database**: Local JSON files (siap migrasi ke MongoDB)
- **Styling**: Custom CSS (Fully responsive)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Setup

1. **Clone atau gunakan project ini**

2. **Install dependencies**
```bash
npm install
```

3. **Jalankan development server**
```bash
npm run dev
```

4. **Buka browser**
```
http://localhost:3000
```

5. **Inisialisasi data sampel**

Saat pertama kali membuka aplikasi, klik tombol untuk inisialisasi data atau akses:
```
POST http://localhost:3000/api/init
```

## 👥 Default Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Operator
- Username: `operator`
- Password: `operator123`

## 📁 Struktur Project

```
versi3/
├── app/
│   ├── admin/              # Admin dashboard
│   │   ├── page.tsx
│   │   └── admin.css
│   ├── operator/           # Operator dashboard
│   │   ├── page.tsx
│   │   └── operator.css
│   ├── api/                # API routes (Backend)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── verify/
│   │   ├── partners/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── scan/
│   │   └── init/
│   ├── page.tsx            # Login page
│   ├── layout.tsx
│   ├── globals.css
│   └── login.css
├── lib/                    # Utilities & Database
│   ├── auth.ts             # Password hashing
│   ├── jwt.ts              # JWT tokens
│   ├── db.ts               # Database CRUD operations
│   ├── utils.ts            # Helper functions
│   ├── constants.ts        # Constants (provinces, etc)
│   └── initData.ts         # Sample data initialization
├── types/
│   └── index.ts            # TypeScript interfaces
├── data/                   # Local database (JSON files)
│   ├── users.json
│   ├── partners.json
│   └── products.json
└── package.json
```

## 🗄️ Database Schema

### User
```typescript
{
  _id: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'operator';
  createdAt: string;
}
```

### Partner
```typescript
{
  _id: string;
  name: string;
  province: string;
  products: string[]; // product IDs
  createdAt: string;
  updatedAt: string;
}
```

### Product
```typescript
{
  _id: string;
  qrCode: string; // Format: UBT-2024-ABC123-001
  partnerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: 'active' | 'scanned' | 'recalled';
  scannedAt?: string;
  scannedBy?: string;
  createdAt: string;
}
```

## 🔄 Migrasi ke MongoDB

Database dirancang dengan schema yang mudah dimigrasi ke MongoDB:

1. **Install MongoDB driver**
```bash
npm install mongodb
```

2. **Update `lib/db.ts`**
   - Ganti fungsi `readData` dan `writeData` dengan MongoDB operations
   - Collection names sudah sesuai: `users`, `partners`, `products`
   - Field `_id` kompatibel dengan MongoDB ObjectId

3. **Update connection string**
```javascript
const client = new MongoClient(process.env.MONGODB_URI);
```

4. **Deploy ke Vercel**
   - Set environment variable `MONGODB_URI`
   - Set `JWT_SECRET` untuk production

## 📱 Responsive Design

- **Mobile First**: Operator page dioptimalkan untuk mobile
- **Tablet Friendly**: Admin page bekerja baik di tablet
- **Desktop**: Full features di desktop
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1023px
  - Desktop: > 1024px

## 🔒 Security

- ✅ Password hashing dengan bcrypt
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Protected API routes
- ⚠️ **Production**: Ganti `JWT_SECRET` di `lib/constants.ts`

## 🚢 Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Vercel

1. Push ke GitHub repository
2. Import project di Vercel
3. Set environment variables:
   - `JWT_SECRET`: Your secure secret key
   - `MONGODB_URI`: MongoDB connection string (jika sudah migrasi)
4. Deploy!

## 📝 Sample Data

Project includes 3 sample partners with products:
- **RS Cipto Mangunkusumo** (DKI Jakarta) - 4 products
- **RS Sardjito** (DI Yogyakarta) - 5 products  
- **RS Hasan Sadikin** (Jawa Barat) - 3 products

Total: 12 produk dengan QR codes siap di-scan.

## 🎨 UI/UX

- **Design**: Clean, minimal, medical-themed
- **Colors**: Professional blue palette
- **Language**: Bahasa Indonesia
- **Icons**: Unicode emojis untuk kompatibilitas
- **Animations**: Smooth transitions

## 🔧 Development

```bash
# Run dev server
npm run dev

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## 📄 License

MIT License - bebas digunakan untuk project pribadi atau komersial.

## 👨‍💻 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.

---

**Made with ❤️ for Medical Technology Distribution**
