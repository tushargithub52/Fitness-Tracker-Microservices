package com.fitnesstracker.aiservice.service;

import com.fitnesstracker.aiservice.model.Activity;
import com.fitnesstracker.aiservice.model.Recommendation;
import com.fitnesstracker.aiservice.repo.RecommendationRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityMessageListener {

    private final ActivityAiService activityAiService;
    private final RecommendationRepo recommendationRepo;

    @KafkaListener(topics = "${kafka.topic.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void processActivity(Activity activity) {
        log.info("Received activity for processing: {}", activity.getId());
        Recommendation recommendation = activityAiService.generateRecommendation(activity);
        recommendationRepo.save(recommendation);
    }
}
