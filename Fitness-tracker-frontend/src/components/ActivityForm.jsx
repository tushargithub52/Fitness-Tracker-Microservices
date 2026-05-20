import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useState } from 'react'
import { addActivity } from '../services/api'

const ActivityForm = ({ onActivityAdded }) => {

  const [activity, setActivity] = useState({
    "type": "",
    "duration": '',
    "caloriesBurned": '',
    "startTime": '',
    "additionalMetrics": {}
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addActivity(activity);
      console.log(activity);
      onActivityAdded;
      setActivity({
        "type": "",
        "duration": '',
        "caloriesBurned": '',
        "startTime": '',
        "additionalMetrics": {}
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Box component="form" sx={{ mb: 2 }} onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{mb: 2}}>
          <InputLabel>Activity Type</InputLabel>
          <Select
            value={activity.type}
            onChange={(e) => {setActivity({...activity, type: e.target.value})}}
            sx={{mb: 2}}
          >
            <MenuItem value="RUNNING">RUNNING</MenuItem>
            <MenuItem value="CYCLING">CYCLING</MenuItem>
            <MenuItem value="SWIMMING">SWIMMING</MenuItem>
            <MenuItem value="WALKING">WALKING</MenuItem>
            <MenuItem value="YOGA">YOGA</MenuItem>
            <MenuItem value="WEIGHT_TRAINING">WEIGHT_TRAINING</MenuItem>
            <MenuItem value="HIIT">HIIT</MenuItem>
            <MenuItem value="CARDIO">CARDIO</MenuItem>
            <MenuItem value="STRETCHING">STRETCHING</MenuItem>
            <MenuItem value="OTHER">OTHER</MenuItem>
          </Select>

          <TextField fullWidth
          label="Duration"
          type='number'
          sx={{mb: 2}}
          value={activity.duration}
          onChange={(e) => {setActivity({...activity, duration: e.target.value})}}
          />

          <TextField fullWidth
          label="Calories Burned"
          type='number'
          sx={{mb: 2}}
          value={activity.caloriesBurned}
          onChange={(e) => {setActivity({...activity, caloriesBurned: e.target.value})}}
          />

          <Button type='submit' variant='contained'>
            Add Activity
          </Button>
        </FormControl>
      </Box>
    </>
  )
}

export default ActivityForm