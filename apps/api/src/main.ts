import { NestFactory } from '@nestjs/core';
import { AppModule } from '#Root/app.module';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { HttpInterceptor } from '#Root/shared/interceptor/http.interceptor';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '#Root/shared/exception/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.getHttpAdapter().getInstance().set('trust proxy', 'loopback, linklocal, uniquelocal');
    app.enableShutdownHooks();
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new HttpInterceptor());
    const prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.enableShutdownHooks(app);
    app.setGlobalPrefix('api');
    app.enableCors({
        credentials: true,
        origin: process.env.WEB_URL,
    });
    await app.listen(process.env.APP_PORT);
}
bootstrap();
