package com.skillswap.app.ui.session;

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
import com.skillswap.app.adapters.SessionAdapter;
import com.skillswap.app.models.Session;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SessionsActivity extends AppCompatActivity implements SessionAdapter.OnSessionClickListener {
    
    private TabLayout tabLayout;
    private RecyclerView sessionsRecyclerView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private View emptyView;
    private View progressBar;
    
    private SessionAdapter adapter;
    private List<Session> sessionsList;
    private ApiService apiService;
    
    private String currentStatus = "";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sessions);
        
        apiService = ApiClient.getApiService();
        
        initViews();
        setupToolbar();
        setupTabs();
        setupRecyclerView();
        loadSessions();
    }
    
    private void initViews() {
        tabLayout = findViewById(R.id.tabLayout);
        sessionsRecyclerView = findViewById(R.id.sessionsRecyclerView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        emptyView = findViewById(R.id.emptyView);
        progressBar = findViewById(R.id.progressBar);
        
        swipeRefreshLayout.setOnRefreshListener(this::loadSessions);
    }
    
    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.sessions);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupTabs() {
        tabLayout.addTab(tabLayout.newTab().setText("All"));
        tabLayout.addTab(tabLayout.newTab().setText("Upcoming"));
        tabLayout.addTab(tabLayout.newTab().setText("In Progress"));
        tabLayout.addTab(tabLayout.newTab().setText("Completed"));
        
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                switch (tab.getPosition()) {
                    case 0:
                        currentStatus = "";
                        break;
                    case 1:
                        currentStatus = "scheduled";
                        break;
                    case 2:
                        currentStatus = "in_progress";
                        break;
                    case 3:
                        currentStatus = "completed";
                        break;
                }
                loadSessions();
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }
    
    private void setupRecyclerView() {
        sessionsList = new ArrayList<>();
        adapter = new SessionAdapter(sessionsList, this);
        sessionsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        sessionsRecyclerView.setAdapter(adapter);
    }
    
    private void loadSessions() {
        showLoading();
        
        apiService.getSessions(currentStatus).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    showEmptyState();
                } else {
                    showEmptyState();
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(SessionsActivity.this, 
                        "Failed to load sessions", Toast.LENGTH_SHORT).show();
                showEmptyState();
            }
        });
    }
    
    private void showEmptyState() {
        sessionsList.clear();
        adapter.notifyDataSetChanged();
        emptyView.setVisibility(View.VISIBLE);
        sessionsRecyclerView.setVisibility(View.GONE);
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
    public void onSessionClick(Session session) {
        // Navigate to session detail
        Toast.makeText(this, "Session: " + session.getId(), Toast.LENGTH_SHORT).show();
    }
}
