import { UserRegistrationEntry } from '../models/UserRegistrationEntry';

export async function registerUserInGroupAsync(
  userId: number,
  groupId: number,
): Promise<void> {
  await UserRegistrationEntry.create({ userId, groupId });
}
