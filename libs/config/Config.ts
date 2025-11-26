import { Logger } from '@nestjs/common';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { readFileSync, existsSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';

interface YamlConfig {
  app: {
    port: number;
    email: string;
  };
  database: {
    url: string;
    logging: boolean;
    sync: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: number | string;
  };
  grpc: {
    user: {
      port: number;
      url: string;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  security: {
    cors: {
      enabled: boolean;
      origins: string[];
      methods: string[];
      credentials: boolean;
      maxAge: number;
    };
    helmet: {
      enabled: boolean;
      contentSecurityPolicy: boolean;
      crossOriginEmbedderPolicy: boolean;
    };
  };
}

function loadYamlConfig(): YamlConfig {
  const configPath = join(process.cwd(), 'config.yml');
  
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const fileContent = readFileSync(configPath, 'utf8');
  return load(fileContent) as YamlConfig;
}

const yamlConfig = loadYamlConfig();

class Configuration {
  private readonly logger = new Logger(Configuration.name);

  @IsBoolean()
  readonly DATABASE_LOGGING = yamlConfig.database.logging;

  @IsString()
  readonly DATABASE_URL = yamlConfig.database.url;

  @IsBoolean()
  readonly DATABASE_SYNC = yamlConfig.database.sync;

  @IsEmail()
  readonly EMAIL = yamlConfig.app.email;

  @IsInt()
  readonly PORT = yamlConfig.app.port;

  @IsString()
  readonly JWT_SECRET = yamlConfig.jwt.secret;

  @IsString()
  readonly JWT_EXPIRES_IN = String(yamlConfig.jwt.expiresIn);

  @IsInt()
  @IsOptional()
  readonly USER_GRPC_PORT = yamlConfig.grpc.user.port;

  @IsString()
  @IsOptional()
  readonly USER_GRPC_URL = yamlConfig.grpc.user.url;

  @IsString()
  readonly REDIS_HOST = yamlConfig.redis.host;

  @IsInt()
  readonly REDIS_PORT = yamlConfig.redis.port;

  @IsString()
  @IsOptional()
  readonly REDIS_PASSWORD = yamlConfig.redis.password || '';

  @IsInt()
  readonly REDIS_DB = yamlConfig.redis.db;

  @IsBoolean()
  readonly CORS_ENABLED = yamlConfig.security.cors.enabled;

  readonly CORS_ORIGINS = yamlConfig.security.cors.origins;

  readonly CORS_METHODS = yamlConfig.security.cors.methods;

  @IsBoolean()
  readonly CORS_CREDENTIALS = yamlConfig.security.cors.credentials;

  @IsInt()
  readonly CORS_MAX_AGE = yamlConfig.security.cors.maxAge;

  @IsBoolean()
  readonly HELMET_ENABLED = yamlConfig.security.helmet.enabled;

  @IsBoolean()
  readonly HELMET_CSP = yamlConfig.security.helmet.contentSecurityPolicy;

  @IsBoolean()
  readonly HELMET_COEP = yamlConfig.security.helmet.crossOriginEmbedderPolicy;

  constructor() {
    const error = validateSync(this);
    if (!error.length) return;
    this.logger.error(`Config validation error: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

export const Config = new Configuration();
