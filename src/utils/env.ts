// Carga variables de entorno desde un archivo .env si existe.
import * as dotenv from 'dotenv';

// Inicializa dotenv para poblar process.env.
dotenv.config();

// Configuración de entorno utilizada por las pruebas.
export const env = {
  // URL base de la aplicación web bajo prueba.
  webBaseUrl: process.env.WEB_BASE_URL || 'https://candidates-qa.contalink.com/',
  // Código de acceso requerido para iniciar sesión en la app.
  webAccessCode: process.env.WEB_ACCESS_CODE || ''
};

// Obtiene una variable de entorno requerida o lanza un error si falta.
export const requireEnv = (key: keyof typeof env): string => {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable for ${key}. Check .env configuration.`);
  }
  return value;
};
