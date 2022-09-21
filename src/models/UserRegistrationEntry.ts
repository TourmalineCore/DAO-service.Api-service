import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { Group } from './Group';
import { User } from './user';

class UserRegistrationEntry extends Model<
  InferAttributes<UserRegistrationEntry>,
  InferCreationAttributes<UserRegistrationEntry>
> {
  declare userId: ForeignKey<User['id']>;
  declare groupId: ForeignKey<Group['id']>;
}

function initRegistration(dataProvider) {
  UserRegistrationEntry.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      groupId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize: dataProvider,
      tableName: 'users_registration',
    },
  );
}

function setRegistrationRelations() {
  UserRegistrationEntry.belongsTo(Group, {
    foreignKey: {
      name: 'groupId',
    },
  });

  UserRegistrationEntry.belongsTo(User, {
    foreignKey: {
      name: 'userId',
    },
  });
}

export { UserRegistrationEntry, initRegistration, setRegistrationRelations };
