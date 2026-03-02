package com.skillswap.app.models;

import com.google.gson.annotations.SerializedName;

public class Feedback {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("sessionId")
    private Session session;
    
    @SerializedName("reviewerId")
    private User reviewer;
    
    @SerializedName("userId")
    private User user;
    
    private int rating;
    private String comment;
    @SerializedName("createdAt")
    private String createdAt;
    
    public Feedback() {}
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Session getSession() {
        return session;
    }
    
    public void setSession(Session session) {
        this.session = session;
    }
    
    public User getReviewer() {
        return reviewer;
    }
    
    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public int getRating() {
        return rating;
    }
    
    public void setRating(int rating) {
        this.rating = rating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
