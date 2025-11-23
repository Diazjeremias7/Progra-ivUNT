const express = require('express');
const vulnerabilityController = require('../controllers/vulnerabilityController');
const { uploadMiddleware, uploadFile } = require('../controllers/uploadController');
const { validateOrigin } = require('../middleware/csrfValidation');

// Función que recibe csrfProtection como parámetro
const configureRoutes = (csrfProtection) => {
    const router = express.Router();

    // Command Injection - sin CSRF (es GET-like)
    router.post('/ping', vulnerabilityController.ping);

    // CSRF - Transferencia AHORA CON PROTECCIÓN
    router.post(
        '/transfer',
        validateOrigin,        // Validar origen
        csrfProtection,        // Token CSRF
        vulnerabilityController.transfer
    );

    // Local File Inclusion - sin CSRF (es GET)
    router.get('/file', vulnerabilityController.readFile);

    // File Upload - con CSRF para mayor seguridad
    router.post(
        '/upload',
        csrfProtection,
        uploadMiddleware,
        uploadFile
    );

    return router;
};

module.exports = configureRoutes;