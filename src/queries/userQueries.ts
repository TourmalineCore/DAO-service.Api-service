import { Op, Sequelize } from 'sequelize';
import { GroupOwners } from '../models/GroupOwners';
import { SearchScope } from '../models/searchScope';
import { DEFAULT_SEARCH_SCOPE, USER_NAME_LENGTH_FOR_SEARCH } from '../consts';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../models/user';

export async function findUsersByParamsAsync(
  groupId: number,
  address?: string,
  searchName?: string,
  scope = DEFAULT_SEARCH_SCOPE,
): Promise<User[]> {
  let searchConditions = {};

  if (address && searchName) {
    throw new HttpException(
      'Handle only one parameter, either Address or SearchName',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (address) {
    searchConditions = { address: { [Op.startsWith]: address } };
  }

  if (searchName) {
    const normilizedSearchName = searchName.replace(/^@| /g, '').toLowerCase();
    if (searchName.length < USER_NAME_LENGTH_FOR_SEARCH) {
      return [];
    }
    searchConditions = {
      [Op.or]: [
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), {
          [Op.startsWith]: '@' + normilizedSearchName,
        }),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('firstName')), {
          [Op.startsWith]: normilizedSearchName,
        }),
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('lastName')), {
          [Op.startsWith]: normilizedSearchName,
        }),
        Sequelize.where(
          Sequelize.fn(
            'concat',
            Sequelize.fn('LOWER', Sequelize.col('firstName')),
            Sequelize.fn('LOWER', Sequelize.col('lastName')),
          ),
          {
            [Op.startsWith]: normilizedSearchName,
          },
        ),
      ],
    };
  }

  const users = await User.findAll({
    where: searchConditions,
  });

  return await filterByDao(users, scope, groupId);
}

export async function findUserByIdAsync(userId: number): Promise<User> {
  return await User.findByPk(userId);
}

export async function findUsersByIdsAsync(userIds: number[]): Promise<User[]> {
  return await User.findAll({
    where: {
      id: userIds,
    },
  });
}

export async function findUserByAddressAsync(address: string): Promise<User> {
  return await User.findOne({ where: { address } });
}

export async function findUsersByAddressesAsync(
  addresses: string[],
): Promise<User[]> {
  return User.findAll({ where: { address: addresses } });
}

async function filterByDao(
  users: User[],
  scope: string,
  groupId: number,
): Promise<User[]> {
  if (scope === SearchScope.ALL) {
    return users;
  }

  const userIdsInGroup = (
    await GroupOwners.findAll({ where: { groupId } })
  ).map((groupOwner) => groupOwner.userId);

  if (scope === SearchScope.IN_DAO) {
    return users.filter((user) => userIdsInGroup.includes(user.id));
  }
  if (scope === SearchScope.ALL_EXCEPT_DAO) {
    return users.filter((user) => !userIdsInGroup.includes(user.id));
  }
}
