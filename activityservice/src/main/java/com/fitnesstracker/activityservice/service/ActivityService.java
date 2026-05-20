package com.fitnesstracker.activityservice.service;

import com.fitnesstracker.activityservice.dto.ActivityRequest;
import com.fitnesstracker.activityservice.dto.ActivityResponse;
import com.fitnesstracker.activityservice.model.Activity;
import com.fitnesstracker.activityservice.repo.ActivityRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepo activityRepo;
    private final UserValidationService userValidationService;
    private final KafkaTemplate<String, Activity> kafkaTemplate;

    @Value("${kafka.topic.name}")
    private String topicName;

    public ResponseEntity<ActivityResponse> trackActivity(ActivityRequest activityRequest) {

        boolean isValidUser = userValidationService.validateUser(activityRequest.getUserId());

        if (!isValidUser) {
            throw new RuntimeException("Invalid user with id "+ activityRequest.getUserId());
        }

        Activity activity = Activity.builder()
                .userId(activityRequest.getUserId())
                .type(activityRequest.getType())
                .duration(activityRequest.getDuration())
                .caloriesBurned(activityRequest.getCaloriesBurned())
                .startTime(activityRequest.getStartTime())
                .additionalMetrics(activityRequest.getAdditionalMetrics())
                .build();

        Activity savedActivity = activityRepo.save(activity);

        try {
            kafkaTemplate.send(topicName, savedActivity.getUserId(), savedActivity);
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while sending message to Kafka", e);
        }

        return ResponseEntity.ok(mapToResponse(savedActivity));
    }

    private ActivityResponse mapToResponse(Activity savedActivity) {
        return ActivityResponse.builder()
                .id(savedActivity.getId())
                .userId(savedActivity.getUserId())
                .type(savedActivity.getType())
                .duration(savedActivity.getDuration())
                .caloriesBurned(savedActivity.getCaloriesBurned())
                .startTime(savedActivity.getStartTime())
                .additionalMetrics(savedActivity.getAdditionalMetrics())
                .createdAt(savedActivity.getCreatedAt())
                .updatedAt(savedActivity.getUpdatedAt())
                .build();
    }

    public ResponseEntity<List<ActivityResponse>> getUserActivities(String userId) {
        List<Activity> activities = activityRepo.findByUserId(userId);
        List<ActivityResponse> activityResponse = activities.stream()
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(activityResponse);
    }

    public ResponseEntity<ActivityResponse> getActivityById(String activityId) {
        ActivityResponse activity = activityRepo.findById(activityId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        return ResponseEntity.ok(activity);
    }

    public ResponseEntity<String> deleteActivity(String activityId, String userId) {
        Activity activity = activityRepo.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        if (!activity.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this activity");
        }
        activityRepo.delete(activity);
        return ResponseEntity.ok("Activity deleted successfully");
    }
}
