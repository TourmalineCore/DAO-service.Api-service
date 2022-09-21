import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { GroupsModule } from '../groups/groups.module';

@Module({
  controllers: [RegistrationController],
  providers: [RegistrationService],
  imports: [GroupsModule],
})
export class RegistrationModule {}
