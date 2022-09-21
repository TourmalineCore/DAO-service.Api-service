import { Module } from '@nestjs/common';
import { DaoService } from './dao.service';
import { DaoController } from './dao.controller';
import { GroupsModule } from '../groups/groups.module';
import { GnosisModule } from '../gnosis/gnosis.module';

@Module({
  controllers: [DaoController],
  providers: [DaoService],
  exports: [DaoService],
  imports: [GroupsModule, GnosisModule],
})
export class DaoModule {}
