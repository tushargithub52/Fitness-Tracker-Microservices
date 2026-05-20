import axios from "axios"

const API_URL = 'http://localhost:8080/api'

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token) {
        config.headers[`Authorization`] = `Bearer ${token}`;
    }

    if (userId) {
        config.headers[`X-User-ID`] = userId;
    }

    return config;
})

export const getActivities = () => api.get('/activities');
export const addActivity = (activity) => api.post('/activities', activity);
export const getActivityDetails = (activityId) => api.get(`/activities/${activityId}`)
export const getActivityAiRecommendations = (activityId) => api.get(`/recommendations/activity/${activityId}`);
export const deleteActivity = (activityId) => api.delete(`/activities/${activityId}`);