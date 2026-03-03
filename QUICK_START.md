# ⚡ QUICK START - SkillSwap Database Setup

## DO THIS IN ORDER:

---

### STEP 1: Create MongoDB (2 min)
1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free" → Sign up
3. Click "Create Cluster" → Choose FREE tier
4. Wait 1-2 min for setup
5. Click "Database" → "Create Database"
   - Database Name: `skillswap`
   - Collection Name: `users`

---

### STEP 2: Get Connection String (1 min)
1. Click "Database" → "Connect"
2. Click "Drivers"
3. Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
```

---

### STEP 3: Deploy Backend on Glitch (2 min)
1. Go to: https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Enter: `Priyanka-N2781/SKILLSWAP`
4. Click "Settings" → "Environment Variables"
5. Add:
   
```
   MONGO_URI = mongodb+srv://your_username:your_password@cluster0.xxxx.mongodb.net/skillswap?retryWrites=true&w=majority
   JWT_SECRET = anyrandomstring123
   
```
6. Check console for URL like: `https://your-project.glitch.me`

---

### STEP 4: Update Android App (1 min)
1. Open: `android/app/src/main/java/com/skillswap/app/utils/Config.java`
2. Change:
   
```
java
   public static final String BASE_URL = "https://your-project.glitch.me/api/";
   
```

---

### STEP 5: Build APK
1. Open Android Studio
2. Open the `android` folder
3. Wait for Gradle sync
4. Build → Build APK
5. Done! ✅

---

## THAT'S IT! Your app is connected to the database!
