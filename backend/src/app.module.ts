import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/env.schema';
import { AdminModule } from './modules/admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DecisionsModule } from './modules/decisions/decisions.module';
import { GroqModule } from './modules/groq/groq.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { AnalysisResultsModule } from './modules/analysis-results/analysis-results.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST') ?? 'localhost',
        port: Number(config.get<number>('DATABASE_PORT') ?? 5432),
        username: config.get<string>('DATABASE_USER') ?? 'postgres',
        password: config.get<string>('DATABASE_PASSWORD') ?? 'postgres',
        database: config.get<string>('DATABASE_NAME') ?? 'dia',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    DecisionsModule,
    AnalysisResultsModule,
    GroqModule,
    AdminModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
