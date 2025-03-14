import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminPanel from "./pages/AdminPanel";
import Unauthorized from "./pages/Unauthorized";
import ErrorPage from "./pages/ErrorPage";
import {SuggestedCategoriesProvider} from "./contexts/SuggestedCategoriesContext";
import {ProductCategoriesProvider} from './hooks/shopping/useProductCategories';
import {ToastProvider} from "./contexts/ToastContext";
import LandingLayout from "./components/landing/layout/LandingLayout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";

function App() {
    return (
        <Router
            future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true
            }}
        >
            <ToastProvider>
                <AuthProvider>
                    <Routes>
                        {/* Landing page routes */}
                        <Route path="/" element={
                            <LandingLayout>
                                <Landing/>
                            </LandingLayout>
                        }/>
                        <Route path="/about" element={
                            <LandingLayout>
                                <About/>
                            </LandingLayout>
                        }/>

                        {/* Auth routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Admin routes */}
                        <Route path="/unauthorized" element={<Unauthorized/>}/>
                        <Route path="/error" element={<ErrorPage/>}/>
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute>
                                    <SuggestedCategoriesProvider>
                                        <ProductCategoriesProvider>
                                            <AdminPanel/>
                                        </ProductCategoriesProvider>
                                    </SuggestedCategoriesProvider>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </ToastProvider>
        </Router>
    );
}

export default App;