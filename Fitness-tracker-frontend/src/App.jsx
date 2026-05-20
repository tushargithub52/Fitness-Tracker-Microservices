import { useContext, useEffect } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { setCredentials } from './store/authSlice';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetails from './components/ActivityDetails';

// MUI dark theme — prevents MUI from injecting white background
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0b0f',
      paper: '#161820',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { backgroundColor: '#0a0b0f' },
        body: { backgroundColor: '#0a0b0f', margin: 0, padding: 0 },
        '#root': { backgroundColor: '#0a0b0f' },
      },
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { token, tokenData } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && tokenData) {
      dispatch(setCredentials({ token, user: tokenData }));
    }
  }, [token, tokenData, dispatch]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div style={{
          minHeight: '100vh',
          width: '100%',
          background: '#0a0b0f',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/activities"
                element={
                  <ProtectedRoute token={token}>
                    <ActivitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities/:id"
                element={
                  <ProtectedRoute token={token}>
                    <ActivityDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
