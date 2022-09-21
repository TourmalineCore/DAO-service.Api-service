import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from './groups/groups.module';
import { WalletConnectSessionsModule } from './wallet-connect-sessions/walletConnectSessions.module';
import { Web3Module } from './web3/web3.module';
import { WalletModule } from './wallet/wallet.module';
import { TelegramDataMiddleware } from './middlewares/telegramDataMiddleware';
import { WalletConnectSessionsController } from './wallet-connect-sessions/walletConnectSessions.controller';
import { GroupsController } from './groups/groups.controller';
import { RedisModule } from './infrastructure/redis/redis.module';
import { PostgresModule } from './infrastructure/postgres/postgres.module';
import { ProposalsModule } from './proposals/proposals.module';
import { GnosisModule } from './gnosis/gnosis.module';
import { UsersModule } from './users/users.module';
import { DaoModule } from './dao/dao.module';
import { AppConfigurationBuilder } from './configs/appConfigurationBuilder';
import { AppConfiguration } from './configs/appConfiguration';
import { AppContext } from './appContext';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';
import { RegistrationModule } from './registration/registration.module';
import { ProposalsController } from './proposals/proposals.controller';
import { DaoController } from './dao/dao.controller';
import { UsersController } from './users/users.controller';
import { RegistrationController } from './registration/registration.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GroupsModule,
    WalletConnectSessionsModule,
    WalletModule,
    Web3Module,
    RedisModule,
    ProposalsModule,
    GnosisModule,
    PostgresModule,
    UsersModule,
    DaoModule,
    SmartContractsModule,
    RegistrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const appConfiguration = AppConfigurationBuilder.build();
    this.configureAppContext(appConfiguration);

    consumer
      .apply(TelegramDataMiddleware)
      .exclude(
        {
          path: 'groups/create',
          method: RequestMethod.POST,
        },
        {
          path: 'groups/:groupId',
          method: RequestMethod.GET,
        },
        {
          path: 'registration',
          method: RequestMethod.POST,
        },
      )
      .forRoutes(
        WalletConnectSessionsController,
        GroupsController,
        ProposalsController,
        DaoController,
        UsersController,
        RegistrationController,
      );
  }

  private configureAppContext(appConfiguration: AppConfiguration) {
    AppContext.network = appConfiguration.NETWORK;
  }
}
