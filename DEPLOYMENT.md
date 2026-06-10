# Deployment Guide

This document explains how to deploy the Deutsch B1 Practice App to various platforms.

---

## 🌐 GitHub Pages (Recommended)

### ✨ Features
- **Free hosting** from GitHub
- **Auto-deployment** on every push to `main`
- **GitHub Actions** for CI/CD pipeline
- **No backend needed** (static site)
- **Custom domain** support

### Setup Steps

#### 1. Enable GitHub Pages

1. Go to GitHub repository settings
2. Navigate to **Settings → Pages**
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

#### 2. GitHub Actions Automatic Deploy

The workflow is already configured in `.github/workflows/deploy.yml`

**What it does:**
- Triggers on every push to `main`
- Installs dependencies
- Runs tests
- Builds static site to `/out`
- Deploys to GitHub Pages
- Provides live URL

**Deployment URL:**
```
https://sudipidus.github.io/deutsch-tests
```

### Monitor Deployments

1. Go to repository **Actions** tab
2. View "Deploy to GitHub Pages" workflow
3. Check status of latest run
4. See deployment URL in run summary

### Custom Domain (Optional)

1. Go to **Settings → Pages**
2. Under "Custom domain", enter your domain
3. Update DNS records (follow GitHub instructions)
4. Enable "Enforce HTTPS"

---

## 🚀 Vercel (Alternative)

### Setup Steps

#### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New → Project**
4. Select `deutsch-tests` repository
5. Click **Import**

#### 2. Configure Build

Settings are auto-detected:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `out`
- **Install Command**: `npm install`

#### 3. Deploy

Click **Deploy** to start build

**Live URL:** `https://deutsch-tests.vercel.app`

### Automatic Deployments

- Every push to `main` triggers auto-deployment
- Preview deployments for pull requests
- Rollback to previous versions instantly

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build image
docker build -t deutsch-tests:latest .

# Test locally
docker run -p 3000:3000 deutsch-tests:latest
```

### Dockerfile Contents

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

### Deploy to Container Registry

#### Docker Hub
```bash
docker login
docker tag deutsch-tests:latest yourusername/deutsch-tests:latest
docker push yourusername/deutsch-tests:latest
```

#### GitHub Container Registry (GHCR)
```bash
docker login ghcr.io -u sudipidus -p $GITHUB_TOKEN
docker tag deutsch-tests:latest ghcr.io/sudipidus/deutsch-tests:latest
docker push ghcr.io/sudipidus/deutsch-tests:latest
```

---

## 📦 Static HTML Export

### Manual Build & Export

```bash
# Install dependencies
npm install

# Build static site
npm run build

# Output is in ./out directory
ls ./out
```

### Upload to Any Web Host

1. Build the app: `npm run build`
2. Upload `./out` folder to web host:
   - **FTP/SFTP**
   - **S3 bucket**
   - **Azure Static Web Apps**
   - **Netlify** (drag & drop)
   - **Surge.sh**
   - Any static hosting

### Example: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=out
```

---

## 🔄 CI/CD Pipeline

### Current GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

**Triggers:** Push to `main` branch

**Steps:**
1. ✅ Checkout code
2. ✅ Setup Node.js 18
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run tests (`npm test`)
5. ✅ Build (`npm run build`)
6. ✅ Upload artifact to GitHub Pages
7. ✅ Deploy to live site

**Duration:** ~2-3 minutes per deployment

### View Workflow Status

- Go to **Actions** tab in GitHub
- Click latest "Deploy to GitHub Pages" workflow
- See detailed logs and status

---

## 🌍 Environment Variables

### GitHub Pages
- No environment variables needed (static site)
- All config in code

### Other Platforms

If needed, add to `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://deutsch-tests.com
```

Note: Only `NEXT_PUBLIC_*` variables are available in static export.

---

## ⚡ Performance Optimization

### Current Optimizations
✅ Static site generation (fast)
✅ CSS minification (Tailwind)
✅ Code splitting (Next.js)
✅ Image optimization
✅ Bundle analysis

### Check Bundle Size

```bash
npm run build

# Analyze in ./out
# Size of HTML/CSS/JS files
ls -lh ./out
```

---

## 🔒 Security

### Current Security Measures
✅ HTTPS enforcement
✅ No sensitive data in code
✅ IndexedDB for local storage
✅ No external API calls
✅ CSP headers (Vercel auto-adds)

### GitHub Pages HTTPS
- ✅ Auto-enabled on `github.io` domains
- ✅ Automatic certificate renewal
- ✅ Enforced for custom domains

---

## 🚨 Troubleshooting

### Build Fails in GitHub Actions

**Check:**
1. Go to Actions → Deploy workflow
2. Click failed run
3. See error in logs
4. Common issues:
   - Test failures: `npm test` failing
   - Lint errors: `npm run lint` failing
   - Build errors: Type errors in code

**Fix:**
```bash
# Run locally to debug
npm ci
npm test
npm run build
```

### Site Not Loading

**Check:**
1. GitHub Pages enabled in Settings
2. Correct branch selected (`main`)
3. Workflow completed successfully
4. Clear browser cache (hard refresh)

### Blank Page on Load

**Likely causes:**
- JavaScript errors (check browser console)
- IndexedDB not accessible (try private browsing)
- Wrong base URL for custom domain

**Fix:**
```bash
# Test locally first
npm run dev

# Then deploy fresh
git push origin main
```

---

## 📊 Deployment Status Dashboard

### GitHub Pages
```
Repository → Settings → Pages
Shows:
- Current deployment status
- Live URL
- Last deployment time
- Custom domain status
```

### View Live Site

After successful deployment:
```
https://sudipidus.github.io/deutsch-tests
```

---

## 📈 Analytics (Optional)

To track usage, add analytics:

### Google Analytics
1. Get tracking ID from Google Analytics
2. Add to `_document.tsx` (if using Pages Router)
3. Track page views and events

### Vercel Analytics
- Auto-included with Vercel deployment
- See **Analytics** tab in Vercel dashboard

---

## 🔄 Rollback Deployment

### GitHub Pages
```bash
# Go back to previous working commit
git revert <bad-commit-hash>
git push origin main

# Automatically redeploys with previous version
```

### Vercel
1. Go to Vercel dashboard
2. Click **Deployments**
3. Find previous working deployment
4. Click **Promote to Production**

---

## 📝 Deployment Checklist

Before each deployment:

- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run build`
- [ ] Code reviewed
- [ ] `.env` variables set (if needed)
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] Git commit message clear
- [ ] Push to `main` branch

---

## 🆘 Support

**Issues with deployment?**

1. Check GitHub Actions logs
2. Review this deployment guide
3. Check Next.js static export docs
4. Check platform-specific docs (Vercel, etc.)

---

**Last Updated**: 2026-06-10
**Status**: ✅ Ready for production
