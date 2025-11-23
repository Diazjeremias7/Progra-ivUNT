// Validadores para diferentes tipos de entrada

/**
 * Valida si una entrada es una dirección IP válida (IPv4)
 */
const isValidIPv4 = (ip) => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

/**
 * Valida si una entrada es un hostname válido
 */
const isValidHostname = (hostname) => {
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname) && hostname.length <= 253;
};

/**
 * Valida si una entrada es un host válido (IP o hostname)
 */
const isValidHost = (host) => {
  if (!host || typeof host !== 'string') {
    return false;
  }
  
  // Verificar longitud razonable
  if (host.length > 255) {
    return false;
  }
  
  // Verificar que no contenga caracteres peligrosos
  const dangerousChars = /[;&|`$(){}[\\]<>'"\\\\]/;
  if (dangerousChars.test(host)) {
    return false;
  }
  
  // Debe ser IP válida o hostname válido
  return isValidIPv4(host) || isValidHostname(host);
};

/**
 * Whitelist de hosts permitidos (puedes expandir esta lista)
 */
const ALLOWED_HOSTS = [
  '8.8.8.8',           // Google DNS
  '8.8.4.4',           // Google DNS
  '1.1.1.1',           // Cloudflare DNS
  '1.0.0.1',           // Cloudflare DNS
  'google.com',
  'cloudflare.com',
  'github.com',
  'localhost'
];

/**
 * Verifica si el host está en la whitelist
 */
const isWhitelistedHost = (host) => {
  return ALLOWED_HOSTS.includes(host.toLowerCase());
};

/**
 * Validación completa para el comando ping
 */
const validatePingHost = (host) => {
  const errors = [];
  
  if (!host) {
    errors.push('El host es requerido');
    return { valid: false, errors };
  }
  
  if (!isValidHost(host)) {
    errors.push('El host debe ser una dirección IP válida o un hostname válido');
    return { valid: false, errors };
  }
  
  // Opcional: descomentar para forzar whitelist
  // if (!isWhitelistedHost(host)) {
  //   errors.push('El host no está en la lista de hosts permitidos');
  //   return { valid: false, errors };
  // }
  
  return { valid: true, errors: [] };
};

module.exports = {
  isValidIPv4,
  isValidHostname,
  isValidHost,
  isWhitelistedHost,
  validatePingHost,
  ALLOWED_HOSTS
};