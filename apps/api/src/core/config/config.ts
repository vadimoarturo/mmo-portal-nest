import * as Joi from 'joi';

const config = () => ({
    APP_PORT: Number(process.env.APP_PORT),
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    JWT_SECRET_ACCESS: process.env.JWT_SECRET_ACCESS,
    JWT_SECRET_ACCESS_EXPIRESIN: process.env.JWT_SECRET_ACCESS_EXPIRESIN,
    JWT_SECRET_VERIFY: process.env.JWT_SECRET_VERIFY,
    JWT_SECRET_VERIFY_EXPIRESIN: process.env.JWT_SECRET_VERIFY_EXPIRESIN,
    JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH,
    JWT_SECRET_REFRESH_EXPIRESIN: process.env.JWT_SECRET_REFRESH_EXPIRESIN,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URLMMO: process.env.DATABASE_URLMMO,
    WEB_URL: process.env.WEB_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FREEKASSA_SHOP_ID: process.env.FREEKASSA_SHOP_ID,
    FREEKASSA_SECRET_ONE: process.env.FREEKASSA_SECRET_ONE,
    FREEKASSA_SECRET_TWO: process.env.FREEKASSA_SECRET_TWO,
    ANYPAY_SHOP_ID: process.env.ANYPAY_SHOP_ID,
    ANYPAY_SECRET: process.env.ANYPAY_SECRET,
    ENOT_SHOP_ID: process.env.ENOT_SHOP_ID,
    ENOT_SECRET_ONE: process.env.ENOT_SECRET_ONE,
    ENOT_SECRET_TWO: process.env.ENOT_SECRET_TWO,
});

export type ConfigType = ReturnType<typeof config>;
export default config;

export const validationSchema = Joi.object({
    APP_PORT: Joi.number().port().default(3010),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().port().default(6379),
    JWT_SECRET_ACCESS: Joi.string().min(32).required(),
    JWT_SECRET_ACCESS_EXPIRESIN: Joi.string().default('15m'),
    JWT_SECRET_VERIFY: Joi.string().min(32).required(),
    JWT_SECRET_VERIFY_EXPIRESIN: Joi.string().default('15m'),
    JWT_SECRET_REFRESH: Joi.string().min(32).required(),
    JWT_SECRET_REFRESH_EXPIRESIN: Joi.string().default('7d'),
    DATABASE_URL: Joi.string()
        .pattern(/^sqlserver:\/\//)
        .required(),
    DATABASE_URLMMO: Joi.string()
        .pattern(/^sqlserver:\/\//)
        .required(),
    WEB_URL: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required(),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().port().default(465),
    SMTP_SECURE: Joi.boolean().default(true),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    FREEKASSA_SHOP_ID: Joi.number().integer().positive().required(),
    FREEKASSA_SECRET_ONE: Joi.string().required(),
    FREEKASSA_SECRET_TWO: Joi.string().required(),
    ANYPAY_SHOP_ID: Joi.number().integer().positive().required(),
    ANYPAY_SECRET: Joi.string().required(),
    ENOT_SHOP_ID: Joi.string().required(),
    ENOT_SECRET_ONE: Joi.string().required(),
    ENOT_SECRET_TWO: Joi.string().required(),
});
