package com.skillswap.app.utils;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import com.google.gson.Gson;

import java.io.IOException;
import java.security.GeneralSecurityException;

public class SessionManager {
    
    private static final String PREF_NAME = "SkillSwapPrefs";
    private static final String KEY_TOKEN = "auth_token";
    private static final String KEY_REMEMBER_TOKEN = "remember_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_USER_EMAIL = "user_email";
    private static final String KEY_USER_PROFILE = "user_profile";
    private static final String KEY_USER_POINTS = "user_points";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";
    private static final String KEY_DARK_MODE = "dark_mode";
    private static final String KEY_NOTIFICATIONS = "notifications_enabled";
    
    private final SharedPreferences prefs;
    private final Gson gson;
    
    public SessionManager(Context context) {
        gson = new Gson();
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();
            
            prefs = EncryptedSharedPreferences.create(
                    context,
                    PREF_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            // Fallback to regular SharedPreferences
            prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        }
    }
    
    public void saveAuthToken(String token) {
        prefs.edit().putString(KEY_TOKEN, token).apply();
    }
    
    public String getAuthToken() {
        return prefs.getString(KEY_TOKEN, null);
    }
    
    public void saveRememberToken(String token) {
        prefs.edit().putString(KEY_REMEMBER_TOKEN, token).apply();
    }
    
    public String getRememberToken() {
        return prefs.getString(KEY_REMEMBER_TOKEN, null);
    }
    
    public void saveUserId(String userId) {
        prefs.edit().putString(KEY_USER_ID, userId).apply();
    }
    
    public String getUserId() {
        return prefs.getString(KEY_USER_ID, null);
    }
    
    public void saveUserName(String name) {
        prefs.edit().putString(KEY_USER_NAME, name).apply();
    }
    
    public String getUserName() {
        return prefs.getString(KEY_USER_NAME, null);
    }
    
    public void saveUserEmail(String email) {
        prefs.edit().putString(KEY_USER_EMAIL, email).apply();
    }
    
    public String getUserEmail() {
        return prefs.getString(KEY_USER_EMAIL, null);
    }
    
    public void saveUserProfile(String profile) {
        prefs.edit().putString(KEY_USER_PROFILE, profile).apply();
    }
    
    public String getUserProfile() {
        return prefs.getString(KEY_USER_PROFILE, null);
    }
    
    public void saveUserPoints(int points) {
        prefs.edit().putInt(KEY_USER_POINTS, points).apply();
    }
    
    public int getUserPoints() {
        return prefs.getInt(KEY_USER_POINTS, 0);
    }
    
    public void setLoggedIn(boolean isLoggedIn) {
        prefs.edit().putBoolean(KEY_IS_LOGGED_IN, isLoggedIn).apply();
    }
    
    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }
    
    public void setDarkMode(boolean enabled) {
        prefs.edit().putBoolean(KEY_DARK_MODE, enabled).apply();
    }
    
    public boolean isDarkMode() {
        return prefs.getBoolean(KEY_DARK_MODE, false);
    }
    
    public void setNotificationsEnabled(boolean enabled) {
        prefs.edit().putBoolean(KEY_NOTIFICATIONS, enabled).apply();
    }
    
    public boolean isNotificationsEnabled() {
        return prefs.getBoolean(KEY_NOTIFICATIONS, true);
    }
    
    public void saveUserData(String token, String rememberToken, String userId, String name, 
                             String email, String profile, int points) {
        prefs.edit()
                .putString(KEY_TOKEN, token)
                .putString(KEY_REMEMBER_TOKEN, rememberToken)
                .putString(KEY_USER_ID, userId)
                .putString(KEY_USER_NAME, name)
                .putString(KEY_USER_EMAIL, email)
                .putString(KEY_USER_PROFILE, profile)
                .putInt(KEY_USER_POINTS, points)
                .putBoolean(KEY_IS_LOGGED_IN, true)
                .apply();
    }
    
    public void logout() {
        prefs.edit().clear().apply();
    }
}
