package com.skillswap.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.skillswap.app.R;
import com.skillswap.app.models.SkillRequest;

import java.util.List;

public class SkillRequestAdapter extends RecyclerView.Adapter<SkillRequestAdapter.RequestViewHolder> {
    
    private List<SkillRequest> requestsList;
    private final OnRequestActionListener listener;
    
    public interface OnRequestActionListener {
        void onAcceptClick(SkillRequest request);
        void onRejectClick(SkillRequest request);
        void onCancelClick(SkillRequest request);
    }
    
    public SkillRequestAdapter(List<SkillRequest> requestsList, OnRequestActionListener listener) {
        this.requestsList = requestsList;
        this.listener = listener;
    }
    
    @NonNull
    @Override
    public RequestViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_skill_request, parent, false);
        return new RequestViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull RequestViewHolder holder, int position) {
        SkillRequest request = requestsList.get(position);
        holder.bind(request, listener);
    }
    
    @Override
    public int getItemCount() {
        return requestsList.size();
    }
    
    static class RequestViewHolder extends RecyclerView.ViewHolder {
        private final TextView skillNameTextView;
        private final TextView requesterTextView;
        private final TextView statusTextView;
        private final TextView dateTextView;
        private final Button actionButton1;
        private final Button actionButton2;
        
        RequestViewHolder(@NonNull View itemView) {
            super(itemView);
            skillNameTextView = itemView.findViewById(R.id.skillNameTextView);
            requesterTextView = itemView.findViewById(R.id.requesterTextView);
            statusTextView = itemView.findViewById(R.id.statusTextView);
            dateTextView = itemView.findViewById(R.id.dateTextView);
            actionButton1 = itemView.findViewById(R.id.actionButton1);
            actionButton2 = itemView.findViewById(R.id.actionButton2);
        }
        
        void bind(SkillRequest request, OnRequestActionListener listener) {
            if (request.getSkill() != null) {
                skillNameTextView.setText(request.getSkill().getName());
            }
            
            if (request.getRequester() != null) {
                requesterTextView.setText("From: " + request.getRequester().getName());
            }
            
            statusTextView.setText(request.getStatus());
            dateTextView.setText(request.getCreatedAt());
            
            // Show/hide buttons based on status
            String status = request.getStatus();
            if ("pending".equals(status)) {
                actionButton1.setText(R.string.accept);
                actionButton2.setText(R.string.reject);
                actionButton1.setVisibility(View.VISIBLE);
                actionButton2.setVisibility(View.VISIBLE);
                
                actionButton1.setOnClickListener(v -> listener.onAcceptClick(request));
                actionButton2.setOnClickListener(v -> listener.onRejectClick(request));
            } else if ("accepted".equals(status)) {
                actionButton1.setText(R.string.cancel);
                actionButton1.setVisibility(View.VISIBLE);
                actionButton2.setVisibility(View.GONE);
                
                actionButton1.setOnClickListener(v -> listener.onCancelClick(request));
            } else {
                actionButton1.setVisibility(View.GONE);
                actionButton2.setVisibility(View.GONE);
            }
        }
    }
}
