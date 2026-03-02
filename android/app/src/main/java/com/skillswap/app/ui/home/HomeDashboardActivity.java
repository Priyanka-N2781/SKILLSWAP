package com.skillswap.app.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.skillswap.app.R;
import com.skillswap.app.models.Gamification;
import com.skillswap.app.models.Skill;
import com.skillswap.app.models.User;
import com.skillswap.app.network.ApiClient;
import com.skillswap.app.network.ApiService;
import com.skillswap.app.ui.auth.LoginActivity;
import com.skillswap.app.ui.history.HistoryActivity;
import com.skillswap.app.ui.profile.ProfileActivity;
import com.skillswap.app.ui.requests.SkillRequestsActivity;
import com.skillswap.app.ui.session.SessionsActivity;
import com.skillswap.app.ui.skill.AddSkillActivity;
import com.skillswap.app.ui.skill.ViewSkillsActivity;
import com.skillswap.app.utils.SessionManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeDashboardActivity extends AppCompatActivity {
    
    private TextView welcomeTextView;
    private TextView pointsTextView;
    private TextView badgesTextView;
    private CardView addSkillCard;
    private CardView viewSkillsCard;
    private CardView skillRequestsCard;
    private CardView sessionsCard;
    private CardView historyCard;
    private CardView profileCard;
    private SwipeRefreshLayout swipeRefreshLayout;
    private View progressBar;
    private View pointsCard;
    
    private SessionManager sessionManager;
    private ApiService apiService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Apply theme
        if (sessionManager == null) {
            sessionManager = new SessionManager(this);
        }
        
        if (sessionManager.isDarkMode()) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        }
        
        setContentView(R.layout.activity_home_dashboard);
        
        apiService = ApiClient.getApiService();
        
        initViews();
        setupNavigation();
        setUserData();
        loadGamificationData();
    }
    
    private void initViews() {
        welcomeTextView = findViewById(R.id.welcomeTextView);
        pointsTextView = findViewById(R.id.pointsTextView);
        badgesTextView = findViewById(R.id.badgesTextView);
        addSkillCard = findViewById(R.id.addSkillCard);
        viewSkillsCard = findViewById(R.id.viewSkillsCard);
        skillRequestsCard = findViewById(R.id.skillRequestsCard);
        sessionsCard = findViewById(R.id.sessionsCard);
        historyCard = findViewById(R.id.historyCard);
        profileCard = findViewById(R.id.profileCard);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        progressBar = findViewById(R.id.progressBar);
        pointsCard = findViewById(R.id.pointsCard);
        
        swipeRefreshLayout.setOnRefreshListener(this::loadGamificationData);
        
        addSkillCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddSkillActivity.class);
            startActivity(intent);
        });
        
        viewSkillsCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, ViewSkillsActivity.class);
            startActivity(intent);
        });
        
        skillRequestsCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, SkillRequestsActivity.class);
            startActivity(intent);
        });
        
        sessionsCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, SessionsActivity.class);
            startActivity(intent);
        });
        
        historyCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, HistoryActivity.class);
            startActivity(intent);
        });
        
        profileCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, ProfileActivity.class);
            startActivity(intent);
        });
        
        pointsCard.setOnClickListener(v -> {
            // Show leaderboard
            Toast.makeText(this, "Leaderboard feature", Toast.LENGTH_SHORT).show();
        });
    }
    
    private void setupNavigation() {
        BottomNavigationView bottomNav = findViewById(R.id.bottomNavigation);
        Menu menu = bottomNav.getMenu();
        MenuItem menuItem = menu.getItem(0);
        menuItem.setChecked(true);
        
        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            
            if (itemId == R.id.nav_home) {
                return true;
            } else if (itemId == R.id.nav_skills) {
                startActivity(new Intent(this, ViewSkillsActivity.class));
                return true;
            } else if (itemId == R.id.nav_requests) {
                startActivity(new Intent(this, SkillRequestsActivity.class));
                return true;
            } else if (itemId == R.id.nav_sessions) {
                startActivity(new Intent(this, SessionsActivity.class));
                return true;
            } else if (itemId == R.id.nav_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                return true;
            }
            
            return false;
        });
    }
    
    private void setUserData() {
        String userName = sessionManager.getUserName();
        int points = sessionManager.getUserPoints();
        
        welcomeTextView.setText("Welcome, " + (userName != null ? userName : "User") + "!");
        pointsTextView.setText(String.valueOf(points));
    }
    
    private void loadGamificationData() {
        showLoading();
        
        apiService.getMyGamification().enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                hideLoading();
                
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> data = response.body();
                    
                    if (data.containsKey("points")) {
                        int points = ((Number) data.get("points")).intValue();
                        pointsTextView.setText(String.valueOf(points));
                        sessionManager.saveUserPoints(points);
                    }
                    
                    if (data.containsKey("badges")) {
                        // Handle badges
                    }
                }
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                hideLoading();
                Toast.makeText(HomeDashboardActivity.this, 
                        "Failed to load data", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.home_menu, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_logout) {
            logout();
            return true;
        } else if (item.getItemId() == R.id.action_theme) {
            toggleTheme();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void logout() {
        sessionManager.logout();
        
        apiService.logout().enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                navigateToLogin();
            }
            
            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                navigateToLogin();
            }
        });
    }
    
    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
    
    private void toggleTheme() {
        boolean newMode = !sessionManager.isDarkMode();
        sessionManager.setDarkMode(newMode);
        
        if (newMode) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        }
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
    protected void onResume() {
        super.onResume();
        setUserData();
        loadGamificationData();
    }
}
