package com.skillswap.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.skillswap.app.R;
import com.skillswap.app.models.Skill;

import java.util.List;

public class SkillAdapter extends RecyclerView.Adapter<SkillAdapter.SkillViewHolder> {
    
    private List<Skill> skillsList;
    private final OnSkillClickListener listener;
    
    public interface OnSkillClickListener {
        void onSkillClick(Skill skill);
    }
    
    public SkillAdapter(List<Skill> skillsList, OnSkillClickListener listener) {
        this.skillsList = skillsList;
        this.listener = listener;
    }
    
    @NonNull
    @Override
    public SkillViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_skill, parent, false);
        return new SkillViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull SkillViewHolder holder, int position) {
        Skill skill = skillsList.get(position);
        holder.bind(skill, listener);
    }
    
    @Override
    public int getItemCount() {
        return skillsList.size();
    }
    
    public void updateData(List<Skill> newSkills) {
        this.skillsList = newSkills;
        notifyDataSetChanged();
    }
    
    static class SkillViewHolder extends RecyclerView.ViewHolder {
        private final TextView nameTextView;
        private final TextView categoryTextView;
        private final TextView levelTextView;
        private final TextView descriptionTextView;
        private final TextView ownerTextView;
        private final ImageView skillImageView;
        
        SkillViewHolder(@NonNull View itemView) {
            super(itemView);
            nameTextView = itemView.findViewById(R.id.skillNameTextView);
            categoryTextView = itemView.findViewById(R.id.categoryTextView);
            levelTextView = itemView.findViewById(R.id.levelTextView);
            descriptionTextView = itemView.findViewById(R.id.descriptionTextView);
            ownerTextView = itemView.findViewById(R.id.ownerTextView);
            skillImageView = itemView.findViewById(R.id.skillImageView);
        }
        
        void bind(Skill skill, OnSkillClickListener listener) {
            nameTextView.setText(skill.getName());
            categoryTextView.setText(skill.getCategory());
            levelTextView.setText(skill.getLevel());
            descriptionTextView.setText(skill.getDescription());
            
            if (skill.getUser() != null) {
                ownerTextView.setText("By: " + skill.getUser().getName());
            }
            
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onSkillClick(skill);
                }
            });
        }
    }
}
