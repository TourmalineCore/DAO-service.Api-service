import { UserRegistrationEntry } from '../models/UserRegistrationEntry';

export async function findUserRegistrationEntryAsync(
  userId: number,
  groupId: number,
): Promise<UserRegistrationEntry> {
  return await UserRegistrationEntry.findOne({ where: { userId, groupId } });
}

export async function getRegisteredUsersCountInGroupAsync(groupId: number) {
  return await UserRegistrationEntry.count({ where: { groupId } });
}

export async function getGroupRegistrationEntriesAsync(
  groupId: number,
): Promise<UserRegistrationEntry[]> {
  return await UserRegistrationEntry.findAll({ where: { groupId } });
}
