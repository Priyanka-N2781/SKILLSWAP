package com.skillswap.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.skillswap.app.R;
import com.skillswap.app.models.HistoryItem;

import java.util.List;

public class HistoryAdapter extends RecyclerView.Adapter<HistoryAdapter.HistoryViewHolder> {
    
    private List<HistoryItem> historyList;
    
    public HistoryAdapter(List<HistoryItem> historyList) {
        this.historyList = historyList;
    }
    
    @NonNull
    @Override
    public HistoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_history, parent, false);
        return new HistoryViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull HistoryViewHolder holder, int position) {
        HistoryItem item = historyList.get(position);
        holder.bind(item);
    }
    
    @Override
    public int getItemCount() {
        return historyList.size();
    }
    
    static class HistoryViewHolder extends RecyclerView.ViewHolder {
        private final TextView titleTextView;
        private final TextView subtitleTextView;
        private final TextView dateTextView;
        private final TextView pointsTextView;
        
        HistoryViewHolder(@NonNull View itemView) {
            super(itemView);
            titleTextView = itemView.findViewById(R.id.titleTextView);
            subtitleTextView = itemView.findViewById(R.id.subtitleTextView);
            dateTextView = itemView.findViewById(R.id.dateTextView);
            pointsTextView = itemView.findViewById(R.id.pointsTextView);
        }
        
        void bind(HistoryItem item) {
            titleTextView.setText(item.getTitle());
            subtitleTextView.setText(item.getSubtitle());
            dateTextView.setText(item.getDate());
            
            if (item.getPoints() != 0) {
                pointsTextView.setVisibility(View.VISIBLE);
                pointsTextView.setText((item.getPoints() > 0 ? "+" : "") + item.getPoints() + " pts");
            } else {
                pointsTextView.setVisibility(View.GONE);
            }
        }
    }
}
