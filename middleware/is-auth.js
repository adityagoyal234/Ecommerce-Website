const routeProtection = async (req, res, next) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    next();
}

const isAdmin = async (req, res, next) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).render('error/403', {
            pageTitle: 'Access Denied',
            path: '/403',
            errorMessage: 'You do not have permission to access this page',
            isAuthenticated: req.session.loggedIn || false,
            user: req.session.user || null
        });
    }
    next();
}

export { routeProtection, isAdmin };