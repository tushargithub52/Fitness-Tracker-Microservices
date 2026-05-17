package com.fitnesstracker.aiservice.service;

import com.fitnesstracker.aiservice.model.Recommendation;
import com.fitnesstracker.aiservice.repo.RecommendationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepo recommendationRepo;

    public ResponseEntity<List<Recommendation>> getUserRecommendations(String userId) {
        return ResponseEntity.ok(recommendationRepo.findByUserId(userId));
    }

    public ResponseEntity<Recommendation> getActivityRecommendation(String activityId) {
        return ResponseEntity.ok(recommendationRepo.findByActivityId(activityId)
                .orElseThrow(() -> new RuntimeException("No recommendation found for the activity "+ activityId)));
    }
}
