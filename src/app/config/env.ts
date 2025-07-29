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

  FRONTEND_URL: string;

  EXPRESS_SESSION_SECRET: string;

  GOOGLE_CALLBACK_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
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

    "FRONTEND_URL",

    "EXPRESS_SESSION_SECRET",

    "GOOGLE_CALLBACK_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];
  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Missing env variable ${variable}`);
    }
  });

  if (envVars.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log({
      callback: process.env.GOOGLE_CALLBACK_URL,
    });
  }

  return {
    PORT: process.env.PORT as string,
    MONGODB_URI: process.env.MONGODB_URI as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,

    ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,

    FRONTEND_URL: process.env.FRONTEND_URL as string,

    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,

    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  };
};

export const envVars: EnvConfig = loadEnvVariables();
