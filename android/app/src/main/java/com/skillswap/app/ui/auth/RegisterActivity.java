package com.skillswap.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.skillswap.app.R;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;
import com.skillswap.app.ui.home.HomeDashboardActivity;
import com.skillswap.app.utils.SessionManager;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {
    
    private TextInputEditText nameEditText;
    private TextInputEditText emailEditText;
    private TextInputEditText passwordEditText;
    private TextInputEditText confirmPasswordEditText;
    private TextInputEditText phoneEditText;
    private AutoCompleteTextView departmentAutoComplete;
    private AutoCompleteTextView yearAutoComplete;
    private MaterialButton registerButton;
    private View progressBar;
    
    private SessionManager sessionManager;
    private ApiService apiService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);
        
        sessionManager = new SessionManager(this);
        apiService = ApiClient.getApiService();
        
        initViews();
        setupDropdowns();
        setClickListeners();
    }
    
    private void initViews() {
        nameEditText = findViewById(R.id.nameEditText);
        emailEditText = findViewById(R.id.emailEditText);
        passwordEditText = findViewById(R.id.passwordEditText);
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText);
        phoneEditText = findViewById(R.id.phoneEditText);
        departmentAutoComplete = findViewById(R.id.departmentAutoComplete);
        yearAutoComplete = findViewById(R.id.yearAutoComplete);
        registerButton = findViewById(R.id.registerButton);
        progressBar = findViewById(R.id.progressBar);
    }
    
    private void setupDropdowns() {
        String[] departments = {"Computer Science", "Engineering", "Business", "Arts", 
                "Science", "Medicine", "Law", "Other"};
        ArrayAdapter<String> deptAdapter = new ArrayAdapter<>(this, 
                android.R.layout.simple_dropdown_item_1line, departments);
        departmentAutoComplete.setAdapter(deptAdapter);
        
        String[] years = {"1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"};
        ArrayAdapter<String> yearAdapter = new ArrayAdapter<>(this, 
                android.R.layout.simple_dropdown_item_1line, years);
        yearAutoComplete.setAdapter(yearAdapter);
    }
    
    private void setClickListeners() {
        registerButton.setOnClickListener(v -> performRegistration());
    }
    
    private void performRegistration() {
        String name = nameEditText.getText().toString().trim();
        String email = emailEditText.getText().toString().trim();
        String password = passwordEditText.getText().toString();
        String confirmPassword = confirmPasswordEditText.getText().toString();
        String phone = phoneEditText.getText().toString().trim();
        String department = departmentAutoComplete.getText().toString();
        String yearStr = yearAutoComplete.getText().toString();
        
        if (name.isEmpty()) {
            nameEditText.setError(getString(R.string.field_required));
            return;
        }
        
        if (email.isEmpty()) {
            emailEditText.setError(getString(R.string.field_required));
            return;
        }
        
        if (password.isEmpty()) {
            passwordEditText.setError(getString(R.string.field_required));
            return;
        }
        
        if (password.length() < 6) {
            passwordEditText.setError(getString(R.string.password_too_short));
            return;
        }
        
        if (!password.equals(confirmPassword)) {
            confirmPasswordEditText.setError(getString(R.string.passwords_dont_match));
            return;
        }
        
        int year = 1;
        if (!yearStr.isEmpty()) {
            year = Integer.parseInt(yearStr.substring(0, 1));
        }
        
        showLoading();
        
        Map<String, Object> request = new HashMap<>();
        request.put("name", name);
        request.put("email", email);
        request.put("password", password);
        request.put("phone", phone);
        request.put("department", department);
        request.put("year", year);
        
        apiService.register(request).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful()) {
                    Toast.makeText(RegisterActivity.this, 
                            "Registration successful! Please verify your email.", 
                            Toast.LENGTH_LONG).show();
                    
                    Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(RegisterActivity.this, 
                            "Registration failed. Email may already be in use.", 
                            Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(RegisterActivity.this, 
                        "Network error: " + t.getMessage(), 
                        Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        registerButton.setEnabled(false);
    }
    
    private void hideLoading() {
        progressBar.setVisibility(View.GONE);
        registerButton.setEnabled(true);
    }
}
