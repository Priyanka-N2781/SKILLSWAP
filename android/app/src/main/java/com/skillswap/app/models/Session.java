package com.skillswap.app.models;

import com.google.gson.annotations.SerializedName;

public class Session {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("skillId")
    private Skill skill;
    
    @SerializedName("skillRequestId")
    private SkillRequest skillRequest;
    
    @SerializedName("learnerId")
    private User learner;
    
    @SerializedName("ownerId")
    private User owner;
    
    private String startDate;
    private String endDate;
    private String status;
    private String remarks;
    @SerializedName("createdAt")
    private String createdAt;
    
    public Session() {}
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Skill getSkill() {
        return skill;
    }
    
    public void setSkill(Skill skill) {
        this.skill = skill;
    }
    
    public SkillRequest getSkillRequest() {
        return skillRequest;
    }
    
    public void setSkillRequest(SkillRequest skillRequest) {
        this.skillRequest = skillRequest;
    }
    
    public User getLearner() {
        return learner;
    }
    
    public void setLearner(User learner) {
        this.learner = learner;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
    
    public String getStartDate() {
        return startDate;
    }
    
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
    
    public String getEndDate() {
        return endDate;
    }
    
    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getRemarks() {
        return remarks;
    }
    
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
