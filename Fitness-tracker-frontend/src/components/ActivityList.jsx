import { Card, CardContent, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { getActivities } from '../services/api';

const ActivityList = () => {

  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchActivities();
  }, [])
  

  return (
    <Grid container spacing={2}>
      {activities.map((activity) => (
        <Grid>
          <Card sx={{cursor: 'pointer'}} onClick={() => navigate(`/activity/${activity._id}`)}>
            <CardContent>
              <Typography variant='h6'>{activity.type}</Typography>
              <Typography variant='h6'>Duration: {activity.duration}</Typography>
              <Typography variant='h6'>Calories: {activity.caloriesBurned}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ActivityList