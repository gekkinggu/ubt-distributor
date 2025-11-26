# UBT Distributor - MongoDB Migration Guide

## ✅ What's Been Done

Your application has been successfully migrated from local JSON files to MongoDB Atlas! Here's what was implemented:

### 1. **MongoDB Setup** ✅
- Installed `mongodb` and `mongoose` packages
- Created connection utility (`lib/mongodb.ts`)
- Environment variables configured (`.env.local`)

### 2. **Database Models** ✅
Created Mongoose schemas for:
- `models/User.ts` - User authentication
- `models/Partner.ts` - Hospital/clinic partners (with full address fields)
- `models/Product.ts` - UBT products with QR codes

### 3. **Database Layer** ✅
- Rewrote `lib/db.ts` to use MongoDB instead of JSON files
- All CRUD operations now use async/await
- Proper date and ObjectId serialization

### 4. **API Routes** ✅
Updated all API endpoints to work with MongoDB:
- `/api/auth/login` - Authentication
- `/api/partners` - Partner management (now includes full address)
- `/api/partners/[id]` - Update/delete partners
- `/api/products` - Product creation
- `/api/products/[id]` - Update product condition
- `/api/products/scan/[qrCode]` - QR code scanning

### 5. **Migration Script** ✅
Created `scripts/migrate.ts` to transfer existing data from JSON to MongoDB

---

## 🚀 How to Complete the Migration

### **Step 1: Verify Your MongoDB Atlas Setup**

1. **IP Whitelist** (IMPORTANT!)
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Click **"Network Access"** (left sidebar)
   - Verify `0.0.0.0/0` is added (allows access from anywhere)
   - If not, click **"Add IP Address"** → **"Allow Access from Anywhere"**

2. **Database User**
   - Click **"Database Access"** (left sidebar)
   - Verify user `ubt_admin` exists
   - Password: `aOasZeatf1PzD2Ll`

### **Step 2: Run the Migration**

Open PowerShell in this directory and run:

\`\`\`powershell
npm run migrate
\`\`\`

This will:
- Connect to MongoDB Atlas
- Clear existing MongoDB data (if any)
- Transfer all users from `data/users.json`
- Transfer all partners from `data/partners.json`
- Transfer all products from `data/products.json`
- Show a summary of migrated records

### **Step 3: Start the Application**

\`\`\`powershell
npm run dev
\`\`\`

The app will now use MongoDB instead of JSON files!

### **Step 4: Test Everything**

1. **Login**: http://localhost:3000
   - Admin: `admin` / `admin123`
   - Operator: `operator` / `operator123`

2. **Admin Dashboard**:
   - ✅ View partners
   - ✅ Add/edit/delete partners (now with full address fields)
   - ✅ Generate QR codes
   - ✅ View products per partner
   - ✅ Update product conditions
   - ✅ Download individual QR codes

3. **Operator Dashboard**:
   - ✅ Scan QR codes (camera/manual/file)
   - ✅ View product details
   - ✅ Update product conditions

---

## 🔧 Important Changes

### **Partner Schema Updated**
Partners now require these fields:
- `name` - Partner name
- `address` - Full address
- `province` - Province/region
- `phone` - Contact number
- `email` - Email address
- `contactPerson` - Contact person name

**Note**: If your existing data only has `name` and `province`, the migration script will add placeholder values for missing fields.

### **Database Location**
- **Before**: Local JSON files in `/data` folder
- **After**: MongoDB Atlas cloud database (`ubt_distributor`)

### **Backup**
Your original `lib/db.ts` was backed up to `lib/db.ts.backup` (just in case)

---

## 📁 New File Structure

\`\`\`
├── .env.local              # MongoDB connection string (DO NOT COMMIT!)
├── .env.example            # Template for environment variables
├── models/
│   ├── User.ts            # Mongoose User model
│   ├── Partner.ts         # Mongoose Partner model
│   └── Product.ts         # Mongoose Product model
├── lib/
│   ├── mongodb.ts         # MongoDB connection utility
│   └── db.ts              # Database CRUD operations (MongoDB version)
└── scripts/
    └── migrate.ts         # Migration script
\`\`\`

---

## 🛠️ Troubleshooting

### **"MongoServerError: bad auth"**
- Check username and password in `.env.local`
- Verify user exists in MongoDB Atlas → Database Access

### **"MongoServerError: IP address is not allowed"**
- Go to MongoDB Atlas → Network Access
- Add `0.0.0.0/0` to whitelist

### **"Cannot connect to MongoDB"**
- Check your internet connection
- Verify cluster is running in MongoDB Atlas
- Check connection string format in `.env.local`

### **Migration fails with "partner ID not found"**
- This is normal if partner IDs changed
- The script handles this automatically

---

## 🔐 Security Notes

- `.env.local` is in `.gitignore` - it won't be committed
- Never share your MongoDB connection string publicly
- Change `JWT_SECRET` in `.env.local` to a random string
- For production, restrict MongoDB IP whitelist to your server's IP

---

## 📊 MongoDB Atlas Dashboard

After migration, view your data:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Database"** → **"Browse Collections"**
3. Select `ubt_distributor` database
4. View collections: `users`, `partners`, `products`

---

## 🎯 Next Steps (Optional)

1. **Production Deployment**: Update `.env.local` with production MongoDB URI
2. **Indexing**: MongoDB automatically indexes `_id`, `qrCode`, and `partnerId`
3. **Backup**: Set up automated backups in MongoDB Atlas
4. **Monitoring**: Enable MongoDB Atlas monitoring for performance tracking

---

## 📝 Environment Variables

Your `.env.local` contains:

\`\`\`env
MONGODB_URI=mongodb+srv://ubt_admin:aOasZeatf1PzD2Ll@cluster0.5wmneva.mongodb.net/ubt_distributor?appName=Cluster0
JWT_SECRET=your-secret-key-change-this-in-production
\`\`\`

**Remember**: Change `JWT_SECRET` to a secure random string!

---

## ✨ Features After Migration

Everything works the same, but now:
- ✅ Data persists in the cloud (MongoDB Atlas)
- ✅ No more JSON file limitations
- ✅ Better performance with indexing
- ✅ Scalable for multiple users
- ✅ Professional database infrastructure
- ✅ Automatic backups (if enabled in Atlas)

---

Ready to migrate? Run: \`npm run migrate\`

If you need help, check the troubleshooting section above!
