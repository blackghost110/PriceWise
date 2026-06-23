import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './home/app.module';
import {ValidationException} from "@common/api/exception/validation.exception";
import {ClassSerializerInterceptor, Logger, ValidationError, ValidationPipe} from "@nestjs/common";
import {configManager} from "@common/config/config.manager";
import {ConfigKey} from "@common/config/enum/config-key.enum";
import {HttpExceptionFilter} from "@common/config/exception/http-exception.filter";
import {swaggerConfiguration} from "@common/documentation/swagger.config";

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix(configManager.getValue(ConfigKey.APP_BASE_URL));
    app.enableCors();
    swaggerConfiguration.config(app);
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe({
        exceptionFactory: (validationErrors: ValidationError[] = []) => new
        ValidationException(validationErrors)
    }));
    await app.listen(parseInt(configManager.getValue(ConfigKey.APP_PORT), 10));
}
bootstrap().then(() => {
    const logger = new Logger('Main Logger');
    logger.log('Server started !!')
});