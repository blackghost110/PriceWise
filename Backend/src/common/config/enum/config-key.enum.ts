export enum ConfigKey {
    DB_HOST = 'DB_HOST',
    DB_PORT = 'DB_PORT',
    DB_USER = 'DB_USER',
    DB_PASSWORD = 'DB_PASSWORD',
    DB_DATABASE = 'DB_DATABASE',
    DB_TYPE = 'DB_TYPE',
    DB_SYNC = 'DB_SYNC',
    FIREBASE_PROJECT_ID = 'FIREBASE_PROJECT_ID',
    FIREBASE_CLIENT_EMAIL = 'FIREBASE_CLIENT_EMAIL',
    FIREBASE_PRIVATE_KEY = 'FIREBASE_PRIVATE_KEY',
    APP_BASE_URL = 'APP_BASE_URL',
    APP_MODE = 'APP_MODE',
    APP_PORT = 'APP_PORT'}
export const configMinimalKeys: ConfigKey[] = Object.keys(ConfigKey) as ConfigKey[];