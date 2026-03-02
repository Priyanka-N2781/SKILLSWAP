package com.skillswap.app.ui.skill;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.SearchView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.skillswap.app.R;
import com.skillswap.app.adapters.SkillAdapter;
import com.skillswap.app.models.Skill;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ViewSkillsActivity extends AppCompatActivity implements SkillAdapter.OnSkillClickListener {
    
    private RecyclerView skillsRecyclerView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private View emptyView;
    private View progressBar;
    private SearchView searchView;
    private FloatingActionButton addSkillFab;
    
    private SkillAdapter adapter;
    private List<Skill> skillsList;
    private ApiService apiService;
    
    private String currentCategory = "";
    private String currentLevel = "";
    private String currentSearch = "";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_skills);
        
        apiService = ApiClient.getApiService();
        
        initViews();
        setupToolbar();
        setupRecyclerView();
        loadSkills();
    }
    
    private void initViews() {
        skillsRecyclerView = findViewById(R.id.skillsRecyclerView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        emptyView = findViewById(R.id.emptyView);
        progressBar = findViewById(R.id.progressBar);
        searchView = findViewById(R.id.searchView);
        addSkillFab = findViewById(R.id.addSkillFab);
        
        swipeRefreshLayout.setOnRefreshListener(this::loadSkills);
        
        addSkillFab.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddSkillActivity.class);
            startActivity(intent);
        });
        
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                currentSearch = query;
                loadSkills();
                return true;
            }
            
            @Override
            public boolean onQueryTextChange(String newText) {
                if (newText.isEmpty()) {
                    currentSearch = "";
                    loadSkills();
                }
                return true;
            }
        });
    }
    
    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.view_skills);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupRecyclerView() {
        skillsList = new ArrayList<>();
        adapter = new SkillAdapter(skillsList, this);
        skillsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        skillsRecyclerView.setAdapter(adapter);
    }
    
    private void loadSkills() {
        showLoading();
        
        apiService.getSkills(currentCategory, currentLevel, currentSearch, 
                "createdAt", "desc", 1, 50).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> data = response.body();
                    
                    if (data.containsKey("skills")) {
                        // Parse skills from response
                        // For now, we'll handle this in adapter
                    }
                }
                
                // Show empty state for demo
                showEmptyState();
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(ViewSkillsActivity.this, 
                        "Failed to load skills", Toast.LENGTH_SHORT).show();
                showEmptyState();
            }
        });
    }
    
    private void showEmptyState() {
        skillsList.clear();
        adapter.notifyDataSetChanged();
        emptyView.setVisibility(View.VISIBLE);
        skillsRecyclerView.setVisibility(View.GONE);
    }
    
    private void showLoading() {
        progressBar.setVisibility(View.VISIBLE);
        swipeRefreshLayout.setRefreshing(true);
    }
    
    private void hideLoading() {
        progressBar.setVisibility(View.GONE);
        swipeRefreshLayout.setRefreshing(false);
    }
    
    @Override
    public void onSkillClick(Skill skill) {
        Intent intent = new Intent(this, SkillDetailActivity.class);
        intent.putExtra("skill_id", skill.getId());
        startActivity(intent);
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.view_skills_menu, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        } else if (item.getItemId() == R.id.action_filter) {
            showFilterDialog();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void showFilterDialog() {
        // Show filter dialog
        Toast.makeText(this, "Filter feature", Toast.LENGTH_SHORT).show();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        loadSkills();
    }
}
