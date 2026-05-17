package com.fitnesstracker.activityservice.repo;

import com.fitnesstracker.activityservice.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepo extends MongoRepository<Activity, String> {
}
