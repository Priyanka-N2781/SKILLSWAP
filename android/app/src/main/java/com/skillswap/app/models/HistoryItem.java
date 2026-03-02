package com.skillswap.app.models;

public class HistoryItem {
    private String id;
    private String title;
    private String subtitle;
    private String date;
    private String type;
    private int points;
    
    public HistoryItem() {}
    
    public HistoryItem(String id, String title, String subtitle, String date, String type, int points) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.date = date;
        this.type = type;
        this.points = points;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getSubtitle() {
        return subtitle;
    }
    
    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }
    
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public int getPoints() {
        return points;
    }
    
    public void setPoints(int points) {
        this.points = points;
    }
}
