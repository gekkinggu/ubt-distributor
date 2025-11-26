# Vercel Deployment Guide

## Environment Variables for Vercel

When deploying to Vercel, add these environment variables in your project settings:

### Required Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://ubt_admin:aOasZeatf1PzD2Ll@cluster0.5wmneva.mongodb.net/ubt_distributor?appName=Cluster0
   ```

2. **JWT_SECRET**
   ```
   your-production-secret-key-change-this
   ```
   ⚠️ **Generate a secure random string**: https://generate-secret.vercel.app/32

---

## Deployment Steps

### 1. Push to GitHub (if not done)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository: `gekkinggu/ubt-distributor`
4. Configure Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add `MONGODB_URI` with your MongoDB connection string
   - Add `JWT_SECRET` with a secure random string
   - Apply to: **Production, Preview, Development**

6. Click **"Deploy"**

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
# Follow prompts and add environment variables when asked
```

### 3. After Deployment

1. **Whitelist Vercel IPs in MongoDB Atlas**:
   - Go to MongoDB Atlas → Network Access
   - If `0.0.0.0/0` is already added, you're good!
   - Otherwise, add Vercel's IP ranges or use `0.0.0.0/0` (allows all)

2. **Run Migration** (First time only):
   - Visit: `https://your-app.vercel.app/migrate`
   - Click "Start Migration"
   - This transfers your local data to MongoDB

3. **Test the Application**:
   - Visit: `https://your-app.vercel.app`
   - Login with: `admin` / `admin123`

---

## Important Notes

### Build Configuration
The following settings ignore warnings during build:
- `eslint.ignoreDuringBuilds: true` - Skips ESLint errors
- `typescript.ignoreBuildErrors: true` - Skips TypeScript errors

### Security
- ✅ `.env.local` is in `.gitignore` (not committed)
- ⚠️ Change `JWT_SECRET` to a secure random string for production
- ✅ MongoDB connection string is secure with user authentication

### Default Credentials
After migration, use these credentials:
- **Admin**: `admin` / `admin123`
- **Operator**: `operator` / `operator123`

⚠️ **Important**: Change these passwords in production!

---

## Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18.x or later)

### Cannot Connect to MongoDB
- Verify MongoDB URI in Vercel environment variables
- Check MongoDB Atlas Network Access whitelist
- Ensure cluster is running

### Authentication Issues
- Verify `JWT_SECRET` is set in Vercel
- Check browser console for errors
- Clear browser localStorage and try again

---

## Your Configuration

**MongoDB Connection String:**
```
mongodb+srv://ubt_admin:aOasZeatf1PzD2Ll@cluster0.5wmneva.mongodb.net/ubt_distributor?appName=Cluster0
```

**Database Name:** `ubt_distributor`

**MongoDB Username:** `ubt_admin`

**MongoDB Password:** `aOasZeatf1PzD2Ll`

---

## Post-Deployment Checklist

- [ ] Application deploys successfully
- [ ] Environment variables are set
- [ ] MongoDB connection works
- [ ] Migration completed (`/migrate` page)
- [ ] Can login as admin
- [ ] Can login as operator
- [ ] Can add/edit/delete partners
- [ ] Can generate QR codes
- [ ] Can scan QR codes
- [ ] All features work as expected

---

Ready to deploy! 🚀
