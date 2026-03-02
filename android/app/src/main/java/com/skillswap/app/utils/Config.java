package com.skillswap.app.utils;

/**
 * Configuration class for API endpoints
 * 
 * FREE HOSTING OPTIONS (choose one):
 * 1. Cyclic: https://cyclic.sh
 * 2. Railway: https://railway.app
 * 3. Glitch: https://glitch.com
 * 4. Render: https://render.com
 * 
 * After deploying, replace the URL below with your live backend URL
 */
public class Config {
    
    // TODO: Replace with your deployed backend URL after hosting
    // Cyclic: "https://app-name.cyclic.app/api/"
    // Railway: "https://app-name.railway.app/api/"
    // Glitch: "https://app-name.glitch.me/api/"
    // Render: "https://app-name.onrender.com/api/"
    
    public static final String BASE_URL = "https://YOUR_APP_NAME.glitch.me/api/";
    
    // Set to false when deploying to production
    public static final boolean DEBUG = false;
}
