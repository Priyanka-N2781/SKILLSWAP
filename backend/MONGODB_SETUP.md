# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Click "Try Free" button
3. Sign up with your email or use Google/GitHub account

## Step 2: Create Free Cluster

1. After login, click "Create a Cluster"
2. Select **FREE** tier (M0)
3. Choose a cloud provider (AWS/Google Cloud/Azure)
4. Select a region closest to you
5. Click "Create Cluster" (may take 1-2 minutes)

## Step 3: Create Database User

1. Click "Database" in left sidebar
2. Click "Database Access"
3. Click "Add New Database User"
4. Enter:
   - Username: `skillswap` (or any name)
   - Password: Create a strong password (e.g., `SkillSwap123!`)
   - Database User Privileges: "Read and Write to any database"
5. Click "Add User"

## Step 4: Network Access (Important!)

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Select "Connect your application"
4. Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
```

## Step 6: Update Connection String

Replace `<username>` and `<password>` with your credentials:
```
mongodb+srv://skillswap:SkillSwap123!@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
```

## Step 7: Add to Your App

### For Local Development (.env file):
```
MONGO_URI=mongodb+srv://skillswap:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=5000
```

### For Glitch.com:
1. Go to your Glitch project
2. Click "Settings" → "Environment Variables"
3. Add:
   - `MONGO_URI`: Your connection string
   - `JWT_SECRET`: Any random string

### For Cyclic.sh:
1. Go to your project dashboard
2. Go to "Variables"
3. Add `MONGO_URI` and `JWT_SECRET`

### For Railway.app:
1. Go to your project
2. Click "Variables" tab
3. Add `MONGO_URI` and `JWT_SECRET`

## Troubleshooting

### If connection fails:
- Check username/password is correct
- Ensure Network Access allows 0.0.0.0/0
- Make sure cluster is not paused (free tier pauses after inactivity)

### Common Error:
```
MongoServerSelectionError: connection <address> timed out
```
**Solution:** Check Network Access settings

---

**Still need help?** Contact me with the error message you're seeing!
