import { Injectable } from '@nestjs/common';
import { RedisService } from '../infrastructure/redis/redis.service';
import IWalletConnectSession from '../models/IWalletConnectSession';
import { UsersService } from '../users/users.service';
import {
  createUserAsync,
  updateUserAddressAsync,
} from '../commands/usersCommands';
import { User } from '../models/user';
import { ethers } from 'ethers';

const SESSION_TTL_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class WalletConnectSessionsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
  ) {}

  async findByUserIdAsync(
    userId: number,
  ): Promise<IWalletConnectSession | null> {
    const user: User = await this.usersService.findByIdAsync(userId);
    if (!user) {
      return null;
    }
    const session = await this.redisService.get<IWalletConnectSession>(userId);

    return session ?? null;
  }

  async createOrUpdateAsync(
    userId: number,
    username: string,
    firstName: string,
    lastName: string,
    session: IWalletConnectSession,
  ): Promise<void> {
    const user: User = await this.usersService.findByIdAsync(userId);

    if (!user) {
      createUserAsync(userId, username, firstName, lastName);
    }

    if (!session.accounts[0]) {
      throw new Error(
        "Couldn't get user account address from a wallet connect session",
      );
    }

    const newUserAddress = ethers.utils.getAddress(session.accounts[0]);

    await this.redisService.set<IWalletConnectSession>(
      userId,
      session,
      SESSION_TTL_IN_SECONDS,
    );

    if (user.address === newUserAddress) {
      return;
    }

    await updateUserAddressAsync(user, newUserAddress);
  }
}
