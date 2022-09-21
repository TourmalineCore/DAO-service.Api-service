import { Group, GROUP_STATE } from '../models/Group';
import { Op } from 'sequelize';
import { GroupOwners } from '../models/GroupOwners';
import { User } from '../models/user';

export async function findPendingGroupsAsync(userId: number): Promise<Group[]> {
  return await Group.findAll({
    where: {
      ownerId: userId,
      state: {
        [Op.or]: [
          GROUP_STATE.REGISTRATION_IS_OPEN,
          GROUP_STATE.DAO_INITIALIZATION,
        ],
      },
    },
  });
}

export async function findUserDaoGroupsAsync(userId: number): Promise<Group[]> {
  const groupOwners = await GroupOwners.findAll({ where: { userId } });

  return await Group.findAll({
    where: {
      id: groupOwners.map((groupOwner) => groupOwner.groupId),
      state: GROUP_STATE.DAO_CREATED,
    },
  });
}

export async function findGroupByIdAsync(groupId: number) {
  return await Group.findByPk(groupId);
}

export async function getGroupUsersAsync(groupId: number): Promise<User[]> {
  const groupOwners = await GroupOwners.findAll({ where: { groupId } });
  const userIds = groupOwners.map((groupOwner) => groupOwner.userId);

  return await Promise.all(
    userIds.map((userId) => {
      return User.findByPk(userId);
    }),
  );
}

export async function isGroupOwnerAsync(
  groupId: number,
  userId: number,
): Promise<boolean> {
  const groupOwners = await GroupOwners.findOne({ where: { groupId, userId } });

  return groupOwners ? true : false;
}
