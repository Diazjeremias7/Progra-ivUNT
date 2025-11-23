const fs = require('fs');
const path = require('path');

// Directorio para logs de seguridad
const LOG_DIR = path.join(__dirname, '../../logs');
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security.log');

// Crear directorio de logs si no existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Registra un evento de seguridad
 */
const logSecurityEvent = (eventType, details) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    ...details
  };
  
  const logLine = JSON.stringify(logEntry) + '\\n';
  
  // Escribir en archivo (en producción usar un sistema de logging robusto)
  fs.appendFile(SECURITY_LOG_FILE, logLine, (err) => {
    if (err) {
      console.error('Error escribiendo log de seguridad:', err);
    }
  });
  
  // También logear en consola en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[SECURITY] ${eventType}:`, details);
  }
};

/**
 * Detecta patrones sospechosos en entrada
 */
const detectSuspiciousInput = (input, type = 'unknown') => {
  const suspiciousPatterns = [
  /[;&|`$()]/,            // Command injection
  /\.\.[\/\\]/,           // Path traversal
  /'.*OR.*'/i,            // SQL injection
  /<script/i,             // XSS
  /exec\s*\(/i,           // Code injection
  /system\s*\(/i,         // System calls
  /eval\s*\(/i            // Eval injection
  ];


  const detectedPatterns = [];
  
  suspiciousPatterns.forEach((pattern, index) => {
    if (pattern.test(input)) {
      detectedPatterns.push({
        patternIndex: index,
        pattern: pattern.toString()
      });
    }
  });
  
  return detectedPatterns;
};

/**
 * Log de intento de command injection
 */
const logCommandInjectionAttempt = (req, input) => {
  const suspicious = detectSuspiciousInput(input, 'command');
  
  if (suspicious.length > 0) {
    logSecurityEvent('COMMAND_INJECTION_ATTEMPT', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      input,
      suspiciousPatterns: suspicious,
      endpoint: req.path
    });
  }
};

/**
 * Log de acceso denegado
 */
const logAccessDenied = (req, reason, resource) => {
  logSecurityEvent('ACCESS_DENIED', {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    reason,
    resource,
    endpoint: req.path
  });
};

module.exports = {
  logSecurityEvent,
  detectSuspiciousInput,
  logCommandInjectionAttempt,
  logAccessDenied
};