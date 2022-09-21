import { findUserByIdAsync } from '../queries/userQueries';
import { Group, GROUP_STATE } from '../models/Group';
import { createUserAsync } from './usersCommands';
import { User } from '../models/user';
import { GroupOwners } from '../models/GroupOwners';

export async function createGroupAsync(
  id: number,
  title: string,
  ownerId: number,
  ownerUsername: string,
  ownerFirstName: string,
  ownerLastName: string,
): Promise<number> {
  const group = new Group({
    id: id,
    title: title,
    ownerId: ownerId,
    state: GROUP_STATE.REGISTRATION_IS_OPEN,
  });

  const user = await findUserByIdAsync(ownerId);

  if (!user) {
    await createUserAsync(
      ownerId,
      ownerUsername,
      ownerFirstName,
      ownerLastName,
    );
  }

  await group.save();

  return group.id;
}

export async function addUserToGroupAsync(userId: number, group: Group) {
  await group.addUsers([userId]);
  await group.save();
}

export async function updateGroupStateAsync(
  group: Group,
  newGroupState: GROUP_STATE,
) {
  group.state = newGroupState;
  await group.save();
}

export async function initDaoAsync(
  group: Group,
  daoAddress: string,
  gnosisUrl: string,
  ownerAddresses: string[],
  threshold: number,
): Promise<void> {
  group.threshold = threshold;
  group.DAOaddress = daoAddress;
  group.gnosisUrl = gnosisUrl;
  group.state = GROUP_STATE.DAO_CREATED;

  await group.save();
  await saveGroupOwnersAsync(group.id, ownerAddresses);
}

export async function addNewGroupOwnerAsync(
  groupId: number,
  ownerAddress: string,
  userId?: number | null,
): Promise<void> {
  await GroupOwners.upsert({
    groupId,
    address: ownerAddress,
    userId: userId ? userId : null,
  });
}

export async function removeGroupOwnerAsync(
  groupId: number,
  ownerAddress: string,
): Promise<void> {
  await GroupOwners.destroy({
    where: {
      groupId,
      address: ownerAddress,
    },
  });
}

async function saveGroupOwnersAsync(
  groupId: number,
  ownerAddresses: string[],
): Promise<void> {
  const users = await User.findAll({
    where: { address: ownerAddresses },
  });

  await Promise.all(
    ownerAddresses.map((address) => {
      const user = users.find((user) => user.address === address);

      return GroupOwners.upsert({
        groupId,
        userId: user ? user.id : null,
        address,
      });
    }),
  );
}
