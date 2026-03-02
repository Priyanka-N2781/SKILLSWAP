package com.skillswap.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.skillswap.app.R;
import com.skillswap.app.models.Session;

import java.util.List;

public class SessionAdapter extends RecyclerView.Adapter<SessionAdapter.SessionViewHolder> {
    
    private List<Session> sessionsList;
    private final OnSessionClickListener listener;
    
    public interface OnSessionClickListener {
        void onSessionClick(Session session);
    }
    
    public SessionAdapter(List<Session> sessionsList, OnSessionClickListener listener) {
        this.sessionsList = sessionsList;
        this.listener = listener;
    }
    
    @NonNull
    @Override
    public SessionViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_session, parent, false);
        return new SessionViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull SessionViewHolder holder, int position) {
        Session session = sessionsList.get(position);
        holder.bind(session, listener);
    }
    
    @Override
    public int getItemCount() {
        return sessionsList.size();
    }
    
    static class SessionViewHolder extends RecyclerView.ViewHolder {
        private final TextView skillNameTextView;
        private final TextView partnerTextView;
        private final TextView dateTextView;
        private final TextView statusTextView;
        
        SessionViewHolder(@NonNull View itemView) {
            super(itemView);
            skillNameTextView = itemView.findViewById(R.id.skillNameTextView);
            partnerTextView = itemView.findViewById(R.id.partnerTextView);
            dateTextView = itemView.findViewById(R.id.dateTextView);
            statusTextView = itemView.findViewById(R.id.statusTextView);
        }
        
        void bind(Session session, OnSessionClickListener listener) {
            if (session.getSkill() != null) {
                skillNameTextView.setText(session.getSkill().getName());
            }
            
            if (session.getLearner() != null) {
                partnerTextView.setText("With: " + session.getLearner().getName());
            }
            
            dateTextView.setText(session.getStartDate() + " - " + session.getEndDate());
            statusTextView.setText(session.getStatus());
            
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onSessionClick(session);
                }
            });
        }
    }
}
