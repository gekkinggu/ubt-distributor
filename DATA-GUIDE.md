# Quick Reference - Data Initialization

## ✅ Data Has Been Initialized!

Your local database now contains:
- 👤 **2 Users** (admin & operator)
- 🏥 **3 Partners** (hospitals)
- 📦 **12 Products** (with QR codes)

## 🔐 Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Operator Account:**
- Username: `operator`
- Password: `operator123`

## 📂 Where is the Data?

All data is stored locally in JSON files:
```
versi3/data/
├── users.json      ← User accounts
├── partners.json   ← Partner/hospital data
└── products.json   ← Products with QR codes
```

**This is 100% local - no external database needed!**

## 🔄 Reinitialize Data

If you need to reset the data, you have 3 options:

### Option 1: Use npm script (Recommended)
```bash
npm run init-data
```

### Option 2: PowerShell script
```powershell
.\scripts\init-data.ps1
```

### Option 3: Delete data files manually
```powershell
Remove-Item data\*.json
# Then reload the login page and click "Initialize"
```

## 🌐 Access the Application

**Login Page:** http://localhost:3000

1. Go to the login page
2. Use the credentials above
3. Enjoy! 🎉

## 📊 Sample Data Details

### Partners Created:
1. **RS Cipto Mangunkusumo** (DKI Jakarta) - 4 products
2. **RS Sardjito** (DI Yogyakarta) - 5 products
3. **RS Hasan Sadikin** (Jawa Barat) - 3 products

### Product Format:
- QR Code: `UBT-2024-XXXXXXXX-XXX`
- Each product has batch number, manufacturing date, expiry date
- Status: All start as "active"

## 🧪 Testing

### Test as Admin:
1. Login as admin
2. View all partners in the table
3. Click "Generate QR" to create more products
4. Download QR codes

### Test as Operator:
1. Login as operator
2. Try all 3 scanning methods:
   - Camera scan
   - Manual input (copy a QR code from admin)
   - Upload QR image

## ❓ Troubleshooting

**Can't login?**
- Run `npm run init-data` to reinitialize
- Check that `data/*.json` files are not empty

**Data folder empty?**
- The files are created automatically on first API call
- Click "Initialize Data" button on login page
- Or run the init script

**Need fresh start?**
- Delete all files in `data/` folder
- Run init script again

---

**Everything is working locally! No database setup required! 🎊**
