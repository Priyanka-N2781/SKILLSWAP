package com.skillswap.app.ui.requests;

import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.material.tabs.TabLayout;
import com.skillswap.app.R;
import com.skillswap.app.adapters.SkillRequestAdapter;
import com.skillswap.app.models.SkillRequest;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SkillRequestsActivity extends AppCompatActivity implements SkillRequestAdapter.OnRequestActionListener {
    
    private TabLayout tabLayout;
    private RecyclerView requestsRecyclerView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private View emptyView;
    private View progressBar;
    
    private SkillRequestAdapter adapter;
    private List<SkillRequest> requestsList;
    private ApiService apiService;
    
    private int currentTab = 0;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_skill_requests);
        
        apiService = ApiClient.getApiService();
        
        initViews();
        setupToolbar();
        setupTabs();
        setupRecyclerView();
        loadRequests();
    }
    
    private void initViews() {
        tabLayout = findViewById(R.id.tabLayout);
        requestsRecyclerView = findViewById(R.id.requestsRecyclerView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        emptyView = findViewById(R.id.emptyView);
        progressBar = findViewById(R.id.progressBar);
        
        swipeRefreshLayout.setOnRefreshListener(this::loadRequests);
    }
    
    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.skill_requests);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupTabs() {
        tabLayout.addTab(tabLayout.newTab().setText(R.string.my_requests));
        tabLayout.addTab(tabLayout.newTab().setText(R.string.incoming_requests));
        
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                currentTab = tab.getPosition();
                loadRequests();
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }
    
    private void setupRecyclerView() {
        requestsList = new ArrayList<>();
        adapter = new SkillRequestAdapter(requestsList, this);
        requestsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        requestsRecyclerView.setAdapter(adapter);
    }
    
    private void loadRequests() {
        showLoading();
        
        Call<Map<String, Object>> call;
        if (currentTab == 0) {
            call = apiService.getMyRequests();
        } else {
            call = apiService.getIncomingRequests();
        }
        
        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    // Parse and display requests
                    showEmptyState();
                } else {
                    showEmptyState();
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(SkillRequestsActivity.this, 
                        "Failed to load requests", Toast.LENGTH_SHORT).show();
                showEmptyState();
            }
        });
    }
    
    private void showEmptyState() {
        requestsList.clear();
        adapter.notifyDataSetChanged();
        emptyView.setVisibility(View.VISIBLE);
        requestsRecyclerView.setVisibility(View.GONE);
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
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    @Override
    public void onAcceptClick(SkillRequest request) {
        // Accept request
        Toast.makeText(this, "Accept request", Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onRejectClick(SkillRequest request) {
        // Reject request
        Toast.makeText(this, "Reject request", Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onCancelClick(SkillRequest request) {
        // Cancel request
        Toast.makeText(this, "Cancel request", Toast.LENGTH_SHORT).show();
    }
}
