package com.skillswap.app.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.button.MaterialButton;
import com.skillswap.app.R;
import com.skillswap.app.models.User;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;
import com.skillswap.app.ui.auth.LoginActivity;
import com.skillswap.app.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {
    
    private ImageView profileImageView;
    private TextView nameTextView;
    private TextView emailTextView;
    private TextView departmentTextView;
    private TextView yearTextView;
    private TextView phoneTextView;
    private TextView pointsTextView;
    private TextView badgesTextView;
    private View progressBar;
    private MaterialButton logoutButton;
    private MaterialButton editProfileButton;
    
    private ApiService apiService;
    private SessionManager sessionManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        
        apiService = ApiClient.getApiService();
        sessionManager = new SessionManager(this);
        
        initViews();
        setupToolbar();
        loadProfile();
    }
    
    private void initViews() {
        profileImageView = findViewById(R.id.profileImageView);
        nameTextView = findViewById(R.id.nameTextView);
        emailTextView = findViewById(R.id.emailTextView);
        departmentTextView = findViewById(R.id.departmentTextView);
        yearTextView = findViewById(R.id.yearTextView);
        phoneTextView = findViewById(R.id.phoneTextView);
        pointsTextView = findViewById(R.id.pointsTextView);
        badgesTextView = findViewById(R.id.badgesTextView);
        progressBar = findViewById(R.id.progressBar);
        logoutButton = findViewById(R.id.logoutButton);
        editProfileButton = findViewById(R.id.editProfileButton);
        
        logoutButton.setOnClickListener(v -> logout());
        editProfileButton.setOnClickListener(v -> {
            // Navigate to edit profile
            Toast.makeText(this, "Edit profile", Toast.LENGTH_SHORT).show();
        });
    }
    
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.profile);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void loadProfile() {
        showLoading();
        
        apiService.getProfile().enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    displayUserProfile(user);
                } else {
                    Toast.makeText(ProfileActivity.this, 
                            "Failed to load profile", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                hideLoading();
                Toast.makeText(ProfileActivity.this, 
                        "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void displayUserProfile(User user) {
        nameTextView.setText(user.getName());
        emailTextView.setText(user.getEmail());
        
        if (user.getDepartment() != null) {
            departmentTextView.setText(user.getDepartment());
        }
        
        if (user.getYear() > 0) {
            yearTextView.setText("Year " + user.getYear());
        }
        
        if (user.getPhone() != null) {
            phoneTextView.setText(user.getPhone());
        }
        
        pointsTextView.setText(String.valueOf(user.getPoints()));
        
        if (user.getBadges() != null && !user.getBadges().isEmpty()) {
            badgesTextView.setText(String.join(", ", user.getBadges()));
        }
    }
    
    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
    }
    
    private void hideLoading() {
        progressBar.setVisibility(View.GONE);
    }
    
    private void logout() {
        sessionManager.logout();
        Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
