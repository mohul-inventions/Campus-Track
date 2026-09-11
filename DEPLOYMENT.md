# CampusTrack — GitHub & Vercel Deployment Guide

This guide provides step-by-step instructions to push **CampusTrack** to your GitHub account and deploy it live to **Vercel**.

---

## 1. Push Project to GitHub

The Git repository has already been initialized and committed on the `main` branch with a complete `.gitignore`.

### Step 1: Create a New GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Set the repository name to `campustrack` (or any name you prefer).
3. Choose **Public** or **Private**.
4. **Do NOT** initialize with a README, .gitignore, or license (these already exist in the project).
5. Click **Create repository**.

### Step 2: Push from your local terminal
Open PowerShell or your terminal in `C:\Users\mohul\.gemini\antigravity\scratch\campustrack` and run:

```bash
# Add your GitHub repo as origin (replace <YOUR_USERNAME> with your actual GitHub username):
git remote add origin https://github.com/<YOUR_USERNAME>/campustrack.git

# Push the codebase to GitHub:
git push -u origin main
```

---

## 2. Setting Up a Free Cloud MySQL Database (Required for Production)

Because CampusTrack uses genuine MySQL 8.0 (stored procedures, triggers, ACID transactions), you need a cloud-hosted MySQL database.

### Recommended Free Provider: Railway.app or Aiven.io
1. Go to [railway.app](https://railway.app) (or [aiven.io](https://aiven.io)).
2. Create a new project and add a **MySQL** database.
3. Under the **Connect** tab, copy your database credentials:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
4. Open **MySQL Workbench** or your preferred database client (or Railway web query editor):
   - Connect using the credentials above.
   - Open and execute the single consolidated file: [`database/complete_init.sql`](database/complete_init.sql).
   - This creates all 8 tables, 3 views, 5 stored procedures, 3 triggers, and seed demo accounts.

---

## 3. Deploying to Vercel

### Recommended Production Architecture (Best Practice)
For database-backed applications, the industry standard is:
- **Frontend:** Hosted on **Vercel** (Global CDN, instant builds).
- **Backend API:** Hosted on **Render.com** (Free always-on Node.js Web Service) or Railway.

---

### Part A: Deploy the Backend API (Render.com - 3 Minutes)
1. Go to [render.com](https://render.com) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository `campustrack`.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. In the **Environment Variables** section, add:
   ```ini
   PORT=5000
   NODE_ENV=production
   DB_HOST=<your-cloud-db-host>
   DB_PORT=<your-cloud-db-port>
   DB_USER=<your-cloud-db-user>
   DB_PASSWORD=<your-cloud-db-password>
   DB_NAME=<your-cloud-db-name>
   JWT_SECRET=campustrack_production_jwt_secret_key_2026
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   ```
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://campustrack-api.onrender.com`).

---

### Part B: Deploy the Frontend to Vercel (2 Minutes)
1. Go to [vercel.com](https://vercel.com) and click **Add New...** ➔ **Project**.
2. Select your `campustrack` GitHub repository.
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   ```ini
   VITE_API_URL=https://campustrack-api.onrender.com/api
   ```
   *(Paste your actual Render/Railway backend URL here, appending `/api`)*
5. Click **Deploy**.

Vercel will build and deploy your React frontend with automated SSL at:
`https://campustrack-<your-username>.vercel.app`

---

## 4. Alternative: Deploy Everything Directly to Vercel (Serverless)

If you prefer to deploy the entire repository directly on Vercel without a separate Render service:
1. Import the root repository `campustrack` into Vercel.
2. Leave Root Directory as `./` (the root).
3. The included [`vercel.json`](vercel.json) will automatically:
   - Build the frontend to `frontend/dist`.
   - Route `/api/*` to the serverless function in [`api/index.js`](api/index.js).
   - Route all frontend pages to `index.html` for client-side routing.
4. Add your cloud database environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`) in the Vercel project settings.
5. Click **Deploy**.

---

## 5. Live Demo Credentials for Viva / Evaluation

Once deployed, the live site includes 1-Click Demo Login buttons for easy presentation:
- **Student Portal:** `student@campustrack.edu` / `Student@123`
- **Admin Dashboard:** `admin@campustrack.edu` / `Admin@123`
