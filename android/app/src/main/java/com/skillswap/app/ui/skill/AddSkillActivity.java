package com.skillswap.app.ui.skill;

import android.os.Bundle;
import android.view.MenuItem;
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

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddSkillActivity extends AppCompatActivity {
    
    private TextInputEditText nameEditText;
    private TextInputEditText descriptionEditText;
    private AutoCompleteTextView categoryAutoComplete;
    private AutoCompleteTextView levelAutoComplete;
    private TextInputEditText tagsEditText;
    private MaterialButton saveButton;
    private View progressBar;
    
    private ApiService apiService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_skill);
        
        apiService = ApiClient.getApiService();
        
        initViews();
        setupDropdowns();
        setupToolbar();
    }
    
    private void initViews() {
        nameEditText = findViewById(R.id.nameEditText);
        descriptionEditText = findViewById(R.id.descriptionEditText);
        categoryAutoComplete = findViewById(R.id.categoryAutoComplete);
        levelAutoComplete = findViewById(R.id.levelAutoComplete);
        tagsEditText = findViewById(R.id.tagsEditText);
        saveButton = findViewById(R.id.saveButton);
        progressBar = findViewById(R.id.progressBar);
        
        saveButton.setOnClickListener(v -> saveSkill());
    }
    
    private void setupDropdowns() {
        String[] categories = {"Programming", "Design", "Music", "Language", 
                "Sports", "Cooking", "Art", "Business", "Science", "Other"};
        ArrayAdapter<String> categoryAdapter = new ArrayAdapter<>(this, 
                android.R.layout.simple_dropdown_item_1line, categories);
        categoryAutoComplete.setAdapter(categoryAdapter);
        
        String[] levels = {"Beginner", "Intermediate", "Advanced", "Expert"};
        ArrayAdapter<String> levelAdapter = new ArrayAdapter<>(this, 
                android.R.layout.simple_dropdown_item_1line, levels);
        levelAutoComplete.setAdapter(levelAdapter);
    }
    
    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.add_skill);
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
    
    private void saveSkill() {
        String name = nameEditText.getText().toString().trim();
        String description = descriptionEditText.getText().toString().trim();
        String category = categoryAutoComplete.getText().toString();
        String level = levelAutoComplete.getText().toString();
        String tagsStr = tagsEditText.getText().toString().trim();
        
        if (name.isEmpty()) {
            nameEditText.setError(getString(R.string.field_required));
            return;
        }
        
        if (description.isEmpty()) {
            descriptionEditText.setError(getString(R.string.field_required));
            return;
        }
        
        if (category.isEmpty()) {
            categoryAutoComplete.setError(getString(R.string.field_required));
            return;
        }
        
        if (level.isEmpty()) {
            levelAutoComplete.setError(getString(R.string.field_required));
            return;
        }
        
        showLoading();
        
        Map<String, Object> request = new HashMap<>();
        request.put("name", name);
        request.put("description", description);
        request.put("category", category);
        request.put("level", level);
        
        if (!tagsStr.isEmpty()) {
            String[] tagsArray = tagsStr.split(",");
            for (int i = 0; i < tagsArray.length; i++) {
                tagsArray[i] = tagsArray[i].trim();
            }
            request.put("tags", tagsArray);
        }
        
        apiService.addSkill(request).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful()) {
                    Toast.makeText(AddSkillActivity.this, 
                            "Skill added successfully!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddSkillActivity.this, 
                            "Failed to add skill", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(AddSkillActivity.this, 
                        "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        saveButton.setEnabled(false);
    }
    
    private void hideLoading() {
        progressBar.setVisibility(View.GONE);
        saveButton.setEnabled(true);
    }
}
