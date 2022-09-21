import {
  Association,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import { Group } from './Group';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: number;
  declare address: string;
  declare username: string;
  declare firstName: string;
  declare lastName: string;

  declare groups?: NonAttribute<Group[]>;

  declare static associations: {
    groups: Association<User, Group>;
  };

  get normalizedUsername(): NonAttribute<string> {
    if (this.username) {
      return this.username;
    }

    if (!this.lastName) {
      return this.firstName;
    }

    return `${this.firstName} ${this.lastName}`;
  }
}

function initUser(dataProvider) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      address: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
        set(newUsername: string) {
          if (newUsername) {
            this.setDataValue(
              'username',
              newUsername.startsWith('@') ? newUsername : `@${newUsername}`,
            );
          }
          return;
        },
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize: dataProvider,
      tableName: 'users',
    },
  );
}

export { User, initUser };
