package com.skillswap.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.skillswap.app.R;
import com.skillswap.app.models.User;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;
import com.skillswap.app.ui.home.HomeDashboardActivity;
import com.skillswap.app.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {
    
    private TextInputEditText emailEditText;
    private TextInputEditText passwordEditText;
    private CheckBox rememberMeCheckBox;
    private MaterialButton loginButton;
    private TextView forgotPasswordTextView;
    private TextView registerTextView;
    private View progressBar;
    
    private SessionManager sessionManager;
    private ApiService apiService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        sessionManager = new SessionManager(this);
        apiService = ApiClient.getApiService();
        
        initViews();
        checkRememberMe();
        setClickListeners();
    }
    
    private void initViews() {
        emailEditText = findViewById(R.id.emailEditText);
        passwordEditText = findViewById(R.id.passwordEditText);
        rememberMeCheckBox = findViewById(R.id.rememberMeCheckBox);
        loginButton = findViewById(R.id.loginButton);
        forgotPasswordTextView = findViewById(R.id.forgotPasswordTextView);
        registerTextView = findViewById(R.id.registerTextView);
        progressBar = findViewById(R.id.progressBar);
    }
    
    private void checkRememberMe() {
        String rememberToken = sessionManager.getRememberToken();
        if (rememberToken != null) {
            loginWithRememberToken(rememberToken);
        }
    }
    
    private void loginWithRememberToken(String token) {
        showLoading();
        
        apiService.loginWithToken(token).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                hideLoading();
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    sessionManager.saveUserData(
                            response.headers().get("Authorization"),
                            sessionManager.getRememberToken(),
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getProfilePicture(),
                            user.getPoints()
                    );
                    navigateToHome();
                }
            }
            
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                hideLoading();
            }
        });
    }
    
    private void setClickListeners() {
        loginButton.setOnClickListener(v -> performLogin());
        
        registerTextView.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
        
        forgotPasswordTextView.setOnClickListener(v -> {
            Toast.makeText(this, "Forgot Password feature", Toast.LENGTH_SHORT).show();
        });
    }
    
    private void performLogin() {
        String email = emailEditText.getText().toString().trim();
        String password = passwordEditText.getText().toString();
        
        if (email.isEmpty()) {
            emailEditText.setError(getString(R.string.field_required));
            return;
        }
        
        if (password.isEmpty()) {
            passwordEditText.setError(getString(R.string.field_required));
            return;
        }
        
        showLoading();
        
        boolean rememberMe = rememberMeCheckBox.isChecked();
        
        apiService.login(email, password, rememberMe).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    
                    String token = response.headers().get("Authorization");
                    String rememberToken = user.getRememberMeToken();
                    
                    sessionManager.saveUserData(
                            token,
                            rememberToken,
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getProfilePicture(),
                            user.getPoints()
                    );
                    
                    Toast.makeText(LoginActivity.this, "Login successful!", Toast.LENGTH_SHORT).show();
                    navigateToHome();
                } else {
                    Toast.makeText(LoginActivity.this, 
                            response.errorBody() != null ? "Login failed" : "Invalid credentials", 
                            Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                hideLoading();
                Toast.makeText(LoginActivity.this, 
                        "Network error: " + t.getMessage(), 
                        Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void navigateToHome() {
        Intent intent = new Intent(LoginActivity.this, HomeDashboardActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
    
    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        loginButton.setEnabled(false);
    }
    
    private void hideLoading() {
        progressBar.setVisibility(View.GONE);
        loginButton.setEnabled(true);
    }
}
