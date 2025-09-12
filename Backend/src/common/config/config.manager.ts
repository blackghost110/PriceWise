import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {ConfigKey, configMinimalKeys} from "@common/config/enum/config-key.enum";
// eslint-disable-next-line
require('dotenv').config();

class ConfigManager {
    constructor(private env: { [k: string]: string | undefined }) {}
    public ensureValues(keys: ConfigKey[]): ConfigManager { // assure que les variable minimum sont existant sinon crash
        keys.forEach((k: ConfigKey) => this.getValue(k, true));
        return this;
    }
    public getTypeOrmConfig(): TypeOrmModuleOptions { // permet de ne pas repeter des bouts de code partout
        return {
            type: this.getValue(ConfigKey.DB_TYPE) as any,
            host: this.getValue(ConfigKey.DB_HOST),
            port: parseInt(this.getValue(ConfigKey.DB_PORT)),
            username: this.getValue(ConfigKey.DB_USER),
            password: this.getValue(ConfigKey.DB_PASSWORD),
            database: this.getValue(ConfigKey.DB_DATABASE),
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            synchronize: (this.getValue(ConfigKey.DB_SYNC)=== 'true') // METTRE CELA EN FALSE UNE FOIS EN PRODUCTION, permet de synchro les shemas vers la DB
        }
    }
    getValue(key: ConfigKey, throwOnMissing = true): string {
        const value = this.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing env.${key}`);
        }
        return <string>value;
    }// MODIF
}
const configManager = new ConfigManager(process.env).ensureValues(configMinimalKeys);
export {configManager}