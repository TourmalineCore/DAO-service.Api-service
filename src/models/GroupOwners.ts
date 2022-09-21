import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { Group } from './Group';

class GroupOwners extends Model<
  InferAttributes<GroupOwners>,
  InferCreationAttributes<GroupOwners>
> {
  declare groupId: ForeignKey<Group['id']>;
  declare address: string;
  declare userId: number;
}

function initGroupOwners(dataProvider) {
  GroupOwners.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      address: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize: dataProvider,
      tableName: 'group_owners',
    },
  );
}

function setGroupOwnersRelations() {
  GroupOwners.belongsTo(Group, {
    foreignKey: {
      name: 'groupId',
    },
  });
}

export { GroupOwners, initGroupOwners, setGroupOwnersRelations };
