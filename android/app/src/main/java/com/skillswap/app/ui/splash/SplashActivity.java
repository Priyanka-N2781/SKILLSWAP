package com.skillswap.app.ui.splash;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.skillswap.app.R;
import com.skillswap.app.ui.auth.LoginActivity;
import com.skillswap.app.utils.SessionManager;

@SuppressLint("CustomSplashScreen")
public class SplashActivity extends AppCompatActivity {
    
    private ImageView logoImageView;
    private TextView taglineTextView;
    private SessionManager sessionManager;
    
    private static final int SPLASH_DELAY = 2000;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        
        sessionManager = new SessionManager(this);
        
        initViews();
        startAnimations();
        navigateToNextScreen();
    }
    
    private void initViews() {
        logoImageView = findViewById(R.id.logoImageView);
        taglineTextView = findViewById(R.id.taglineTextView);
    }
    
    private void startAnimations() {
        Animation fadeIn = AnimationUtils.loadAnimation(this, android.R.anim.fade_in);
        fadeIn.setDuration(1000);
        
        logoImageView.startAnimation(fadeIn);
        taglineTextView.startAnimation(fadeIn);
    }
    
    private void navigateToNextScreen() {
        new Handler().postDelayed(() -> {
            Intent intent;
            if (sessionManager.isLoggedIn()) {
                intent = new Intent(SplashActivity.this, com.skillswap.app.ui.home.HomeDashboardActivity.class);
            } else {
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            }
            startActivity(intent);
            finish();
        }, SPLASH_DELAY);
    }
}
