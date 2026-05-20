import { Box, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { useDispatch } from 'react-redux';
import {BrowserRouter as Router, Navigate, Routes, Route, useLocation} from 'react-router'
import { setCredentials } from './store/authSlice';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import ActivityDetails from './components/ActivityDetails';

function App() {

  const {token, tokenData, logIn, logOut, isAuthenticated} = useContext(AuthContext);
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({token, user: tokenData}));
      setAuthReady(true);
    }
  }, [token, tokenData, dispatch])

  const ActivitiesPage = () => {
    return (
      <Box sx={{ p: 2, border: '1px dashed grey' }}>
        <ActivityForm onActivitiesAdded = {() => window.location.reload()} />
        <ActivityList />
      </Box>
    );
  }
  

  return (
    <Router>
      {!token ? (
        <Button variant="contained" onClick={() => logIn()}>
          Login
        </Button>
      ) : (
        <Box component="section" sx={{ p: 2, border: '1px dashed grey' }} >
          <Button variant="contained" onClick={() => logOut()} sx={{mb: 2}}>
            Logout 
          </Button>
          <Routes>
            <Route path='/activities' element={<ActivitiesPage />} />
            <Route path='/activities/:id' element={<ActivityDetails />} />
            <Route path='/' element={
              token ? <Navigate to="/activities" replace /> : <div>Welcome to our App, Please Login to continue</div>
            } />
          </Routes>
        </Box>
      )}
    </Router>
  )
}

export default App