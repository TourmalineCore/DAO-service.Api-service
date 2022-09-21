import { Sequelize } from 'sequelize';
import {
  initGroupOwners,
  setGroupOwnersRelations,
} from '../../models/GroupOwners';
import {
  initRegistration,
  setRegistrationRelations,
} from '../../models/UserRegistrationEntry';
import { initGroup, setGroupRelations } from '../../models/Group';
import { initProposal, setProposalRelations } from '../../models/Proposal';
import { initUser } from '../../models/user';

export const postgresProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
      });

      initGroup(sequelize);
      initUser(sequelize);
      initProposal(sequelize);
      initRegistration(sequelize);
      initGroupOwners(sequelize);

      setGroupRelations();
      setProposalRelations();
      setRegistrationRelations();
      setGroupOwnersRelations();

      await sequelize.sync({ alter: true });
      return sequelize;
    },
  },
];
