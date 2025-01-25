import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import AdminPanel from "./pages/AdminPanel";
import Unauthorized from "./pages/Unauthorized";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginForm/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <AdminPanel/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;