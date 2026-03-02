package com.skillswap.app.ui.history;

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
import com.skillswap.app.adapters.HistoryAdapter;
import com.skillswap.app.models.HistoryItem;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HistoryActivity extends AppCompatActivity {
    
    private TabLayout tabLayout;
    private RecyclerView historyRecyclerView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private View emptyView;
    private View progressBar;
    
    private HistoryAdapter adapter;
    private List<HistoryItem> historyList;
    private ApiService apiService;
    
    private int currentTab = 0;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_history);
        
        apiService = ApiClient.getApiService();
        
        initViews();
        setupToolbar();
        setupTabs();
        setupRecyclerView();
        loadHistory();
    }
    
    private void initViews() {
        tabLayout = findViewById(R.id.tabLayout);
        historyRecyclerView = findViewById(R.id.historyRecyclerView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        emptyView = findViewById(R.id.emptyView);
        progressBar = findViewById(R.id.progressBar);
        
        swipeRefreshLayout.setOnRefreshListener(this::loadHistory);
    }
    
    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.history);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }
    
    private void setupTabs() {
        tabLayout.addTab(tabLayout.newTab().setText("Sessions"));
        tabLayout.addTab(tabLayout.newTab().setText("Requests"));
        tabLayout.addTab(tabLayout.newTab().setText("Points"));
        
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                currentTab = tab.getPosition();
                loadHistory();
            }
            
            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}
            
            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }
    
    private void setupRecyclerView() {
        historyList = new ArrayList<>();
        adapter = new HistoryAdapter(historyList);
        historyRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        historyRecyclerView.setAdapter(adapter);
    }
    
    private void loadHistory() {
        showLoading();
        
        Call<Map<String, Object>> call;
        switch (currentTab) {
            case 0:
                call = apiService.getSessionHistory();
                break;
            case 1:
                call = apiService.getRequestHistory();
                break;
            case 2:
                call = apiService.getPointsHistory();
                break;
            default:
                call = apiService.getSessionHistory();
        }
        
        call.enqueue(new Callback<Map<String, Object>>() {
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
                Toast.makeText(HistoryActivity.this, 
                        "Failed to load history", Toast.LENGTH_SHORT).show();
                showEmptyState();
            }
        });
    }
    
    private void showEmptyState() {
        historyList.clear();
        adapter.notifyDataSetChanged();
        emptyView.setVisibility(View.VISIBLE);
        historyRecyclerView.setVisibility(View.GONE);
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
}
