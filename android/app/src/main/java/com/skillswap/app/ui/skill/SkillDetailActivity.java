package com.skillswap.app.ui.skill;

import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.skillswap.app.R;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SkillDetailActivity extends AppCompatActivity {
    
    private TextView nameTextView;
    private TextView categoryTextView;
    private TextView levelTextView;
    private TextView descriptionTextView;
    private TextView ownerTextView;
    private Button requestButton;
    private View progressBar;
    
    private ApiService apiService;
    private String skillId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_skill_detail);
        
        apiService = ApiClient.getApiService();
        skillId = getIntent().getStringExtra("skill_id");
        
        initViews();
        setupToolbar();
        loadSkillDetails();
    }
    
    private void initViews() {
        nameTextView = findViewById(R.id.nameTextView);
        categoryTextView = findViewById(R.id.categoryTextView);
        levelTextView = findViewById(R.id.levelTextView);
        descriptionTextView = findViewById(R.id.descriptionTextView);
        ownerTextView = findViewById(R.id.ownerTextView);
        requestButton = findViewById(R.id.requestButton);
        progressBar = findViewById(R.id.progressBar);
        
        requestButton.setOnClickListener(v -> sendRequest());
    }
    
    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Skill Details");
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
    
    private void loadSkillDetails() {
        showLoading();
        
        apiService.getSkill(skillId).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> data = response.body();
                    
                    // Parse and display skill details
                    if (data.containsKey("skill")) {
                        // Update UI with skill data
                    }
                } else {
                    Toast.makeText(SkillDetailActivity.this, 
                            "Failed to load skill", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(SkillDetailActivity.this, 
                        "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void sendRequest() {
        showLoading();
        
        Map<String, Object> request = new HashMap<>();
        request.put("skillId", skillId);
        
        apiService.sendSkillRequest(request).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful()) {
                    Toast.makeText(SkillDetailActivity.this, 
                            "Request sent successfully!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(SkillDetailActivity.this, 
                            "Failed to send request", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(SkillDetailActivity.this, 
                        "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        requestButton.setEnabled(false);
    }
    
    private void hideLoading() {
        progressBar.setVisibility(View.GONE);
        requestButton.setEnabled(true);
    }
}
