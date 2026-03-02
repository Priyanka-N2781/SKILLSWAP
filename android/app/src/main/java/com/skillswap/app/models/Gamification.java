package com.skillswap.app.models;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Gamification {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("userId")
    private User user;
    
    private int points;
    private List<String> badges;
    @SerializedName("totalSessions")
    private int totalSessions;
    @SerializedName("totalSkills")
    private int totalSkills;
    @SerializedName("completedSessions")
    private int completedSessions;
    @SerializedName("createdAt")
    private String createdAt;
    
    public Gamification() {}
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public int getPoints() {
        return points;
    }
    
    public void setPoints(int points) {
        this.points = points;
    }
    
    public List<String> getBadges() {
        return badges;
    }
    
    public void setBadges(List<String> badges) {
        this.badges = badges;
    }
    
    public int getTotalSessions() {
        return totalSessions;
    }
    
    public void setTotalSessions(int totalSessions) {
        this.totalSessions = totalSessions;
    }
    
    public int getTotalSkills() {
        return totalSkills;
    }
    
    public void setTotalSkills(int totalSkills) {
        this.totalSkills = totalSkills;
    }
    
    public int getCompletedSessions() {
        return completedSessions;
    }
    
    public void setCompletedSessions(int completedSessions) {
        this.completedSessions = completedSessions;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
