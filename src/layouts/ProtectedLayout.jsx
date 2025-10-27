import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

function ProtectedLayout({ children, isAdmin }) {
    const user = useSelector((state) => state.auth);

    if (!user.isLoggedIn) {
        return <Navigate to="/login" replace />
    }

    if (isAdmin && !user.user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children
}

export default ProtectedLayout
