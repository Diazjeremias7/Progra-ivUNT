/**
 * Middleware adicional para validar origen de peticiones
 */
const validateOrigin = (req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://frontend:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean);

    const origin = req.get('origin');
    const referer = req.get('referer');

    // Permitir requests sin origin (como desde Postman en desarrollo)
    if (process.env.NODE_ENV === 'development' && !origin && !referer) {
        return next();
    }

    // Validar origin
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({
            error: 'Origen no permitido',
            message: 'La petición proviene de un origen no autorizado'
        });
    }

    // Validar referer como respaldo
    if (!origin && referer) {
        const refererOrigin = new URL(referer).origin;
        if (!allowedOrigins.includes(refererOrigin)) {
            return res.status(403).json({
                error: 'Referer no permitido',
                message: 'La petición proviene de un origen no autorizado'
            });
        }
    }

    next();
};

/**
 * Middleware para requerir re-autenticación en operaciones sensibles
 */
const requireReauth = (req, res, next) => {
    // Verificar si la sesión tiene timestamp de última autenticación
    const lastAuth = req.session.lastAuthTime;
    const now = Date.now();
    const REAUTH_TIMEOUT = 5 * 60 * 1000; // 5 minutos

    if (!lastAuth || (now - lastAuth) > REAUTH_TIMEOUT) {
        return res.status(403).json({
            error: 'Re-autenticación requerida',
            message: 'Por seguridad, debe volver a autenticarse para esta operación',
            requiresReauth: true
        });
    }

    next();
};

/**
 * Actualizar timestamp de última autenticación
 */
const updateAuthTime = (req) => {
    if (req.session) {
        req.session.lastAuthTime = Date.now();
    }
};

module.exports = {
    validateOrigin,
    requireReauth,
    updateAuthTime
};