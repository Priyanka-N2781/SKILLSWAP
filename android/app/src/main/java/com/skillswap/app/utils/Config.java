package com.skillswap.app.utils;

/**
 * Configuration class for API endpoints
 * Change BASE_URL to your deployed backend URL when hosting
 */
public class Config {
    
    // For Android Emulator (local testing): http://10.0.2.2:5000/api/
    // For Real Device (local testing): http://YOUR_PC_IP:5000/api/
    // For Deployed Backend: https://your-render-app-name.onrender.com/api/
    
    // TODO: Replace with your deployed Render URL after hosting
    public static final String BASE_URL = "https://skillswap-backend.onrender.com/api/";
    
    // Development mode - set to false when deploying
    public static final boolean IS_DEVELOPMENT = false;
}
