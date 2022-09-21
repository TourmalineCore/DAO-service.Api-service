import { Injectable } from '@nestjs/common';
import { isNull } from 'lodash';
import { UserRegistrationEntry } from '../models/UserRegistrationEntry';
import { registerUserInGroupAsync } from '../commands/usersRegistrationCommands';
import { findUserByIdAsync } from '../queries/userQueries';
import {
  findUserRegistrationEntryAsync,
  getGroupRegistrationEntriesAsync,
} from '../queries/usersRegistrationQueries';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class RegistrationService {
  constructor(private readonly groupsService: GroupsService) {}

  async registerUserAsync(userId: number, groupId: number): Promise<void> {
    const group = await this.groupsService.findByIdAsync(groupId);

    if (!group) {
      throw new Error(`Group with id ${groupId} does not exist`);
    }

    if (group.isRegistrationClosed) {
      throw new Error(`Registration is closed`);
    }

    if (group.ownerId === userId) {
      throw new Error(`You are already registered`);
    }

    const user = await findUserByIdAsync(userId);

    if (!user) {
      throw new Error(
        `Please, connect your Metamask account in a private chat with the bot`,
      );
    }

    const userRegistrationEntry = await findUserRegistrationEntryAsync(
      userId,
      groupId,
    );

    if (userRegistrationEntry) {
      throw new Error(`You are already registered`);
    }

    await registerUserInGroupAsync(userId, groupId);
  }

  async findRegistredUsersInGroupAsync(groupId: number) {
    const registrationEntries: UserRegistrationEntry[] =
      await getGroupRegistrationEntriesAsync(groupId);

    if (registrationEntries.length === 0) {
      return [];
    }

    const users = await Promise.all(
      registrationEntries.map((registrationEntry) =>
        findUserByIdAsync(registrationEntry.userId),
      ),
    );

    return users.filter((user) => !isNull(user.address));
  }
}
