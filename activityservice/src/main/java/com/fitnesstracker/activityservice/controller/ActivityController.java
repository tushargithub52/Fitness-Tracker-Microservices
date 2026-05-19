package com.fitnesstracker.activityservice.controller;

import com.fitnesstracker.activityservice.dto.ActivityRequest;
import com.fitnesstracker.activityservice.dto.ActivityResponse;
import com.fitnesstracker.activityservice.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {

    private ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(@RequestBody ActivityRequest activityRequest) {
        return activityService.trackActivity(activityRequest);
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getUserActivities(@RequestHeader("X-User-ID") String userId){
        return activityService.getUserActivities(userId);
    }


    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(@PathVariable String activityId){
        return activityService.getActivityById(activityId);
    }
}
