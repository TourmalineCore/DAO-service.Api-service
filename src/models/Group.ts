import {
  Association,
  DataTypes,
  ForeignKey,
  HasManyAddAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import { GroupOwners } from './GroupOwners';
import { User } from './user';
import { isNil } from 'lodash';

enum GROUP_STATE {
  REGISTRATION_IS_OPEN = 'registration is open',
  DAO_INITIALIZATION = 'DAO initialization',
  DAO_CREATED = 'DAO created',
}

class Group extends Model<
  InferAttributes<Group>,
  InferCreationAttributes<Group>
> {
  declare id: number;
  declare title: string;
  declare DAOaddress: string | null;
  declare threshold: number | null;
  declare state: GROUP_STATE;
  declare gnosisUrl: string | null;

  declare users?: NonAttribute<User[]>;
  declare ownerId: ForeignKey<User['id']>;
  declare addUsers: HasManyAddAssociationsMixin<User, number>;
  declare getGroupOwners: () => Promise<GroupOwners[]>;

  declare createdAt: Date;

  declare static associations: {
    users: Association<Group, User>;
  };

  public async getUsersCount(): Promise<number> {
    const groupOwners = await this.getGroupOwners();

    return groupOwners.length;
  }

  public get isRegistrationClosed(): NonAttribute<boolean> {
    return this.state !== GROUP_STATE.REGISTRATION_IS_OPEN;
  }

  public get isDao(): NonAttribute<boolean> {
    return !isNil(this.DAOaddress);
  }
}

function initGroup(dataProvider) {
  Group.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
      },
      DAOaddress: {
        type: DataTypes.STRING,
        unique: true,
      },
      gnosisUrl: {
        type: DataTypes.STRING,
      },
      threshold: {
        type: DataTypes.INTEGER,
      },
      state: {
        type: DataTypes.STRING,
        set(newState: GROUP_STATE) {
          const currentState = this.getDataValue('state');

          if (!currentState) {
            this.setDataValue('state', GROUP_STATE.REGISTRATION_IS_OPEN);
            return;
          }

          if (!Object.values(GROUP_STATE).includes(newState)) {
            throw new Error('The new group state has invalid value');
          }

          const groupStateChangeRules = {
            [GROUP_STATE.REGISTRATION_IS_OPEN]: [
              GROUP_STATE.REGISTRATION_IS_OPEN,
              GROUP_STATE.DAO_INITIALIZATION,
            ],
            [GROUP_STATE.DAO_INITIALIZATION]: [
              GROUP_STATE.REGISTRATION_IS_OPEN,
              GROUP_STATE.DAO_INITIALIZATION,
              GROUP_STATE.DAO_CREATED,
            ],
          };

          const groupStateChangeRule: GROUP_STATE[] =
            groupStateChangeRules[currentState];

          if (!groupStateChangeRule) {
            throw new Error(
              `Group state '${currentState}' cannot be changed on '${newState}'`,
            );
          }

          if (!groupStateChangeRule.includes(newState)) {
            throw new Error(
              `Group state '${currentState}' cannot be changed on '${newState}'`,
            );
          }

          this.setDataValue('state', newState);
        },
      },
      ownerId: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize: dataProvider,
      tableName: 'groups',
    },
  );
}

function setGroupRelations() {
  Group.belongsTo(User, {
    foreignKey: {
      name: 'ownerId',
    },
  });

  Group.hasMany(GroupOwners, {
    foreignKey: {
      name: 'groupId',
    },
  });
}

export { GROUP_STATE, Group, initGroup, setGroupRelations };
