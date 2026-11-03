import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from '#Core/prisma/prisma.service';
import { HttpInterceptor } from '#Common/interceptor/http.interceptor';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '#Common/exception/http-exception.filter';
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
