import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
    return (
        <Router>
            <AdminPanel />
        </Router>
    );
};

export default App;