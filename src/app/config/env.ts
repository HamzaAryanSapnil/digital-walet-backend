import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  MONGODB_URI: string;
  NODE_ENV: "development" | "production";

  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;

  BCRYPT_SALT_ROUND: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_PHONE: string;

  FRONTEND_URL: string;

  EXPRESS_SESSION_SECRET: string;

  GOOGLE_CALLBACK_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_PORT: string;
    SMTP_HOST: string;
    SMTP_FROM: string;
  };
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "MONGODB_URI",
    "NODE_ENV",

    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",

    "BCRYPT_SALT_ROUND",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_PHONE",

    "FRONTEND_URL",

    "EXPRESS_SESSION_SECRET",

    "GOOGLE_CALLBACK_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",

    "SMTP_PASS",
    "SMTP_PORT",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_FROM",
  ];
  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Missing env variable ${variable}`);
    }
  });

 

  return {
    PORT: process.env.PORT as string,
    MONGODB_URI: process.env.MONGODB_URI as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,

    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    ADMIN_PHONE: process.env.ADMIN_PHONE as string,

    FRONTEND_URL: process.env.FRONTEND_URL as string,

    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,

    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,

    EMAIL_SENDER: {
      SMTP_USER: process.env.SMTP_USER as string,
      SMTP_PASS: process.env.SMTP_PASS as string,
      SMTP_PORT: process.env.SMTP_PORT as string,
      SMTP_HOST: process.env.SMTP_HOST as string,
      SMTP_FROM: process.env.SMTP_FROM as string,
    },
  };
};

export const envVars: EnvConfig = loadEnvVariables();
