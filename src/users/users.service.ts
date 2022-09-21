import { Injectable } from '@nestjs/common';
import { User } from '../models/user';
import {
  findUserByIdAsync,
  findUsersByParamsAsync,
} from '../queries/userQueries';

@Injectable()
export class UsersService {
  async findByParamsAsync(
    groupId: number,
    address?: string,
    searchName?: string,
    scope?: string,
  ): Promise<User[]> {
    return await findUsersByParamsAsync(groupId, address, searchName, scope);
  }

  async findByIdAsync(userId: number): Promise<User> {
    return await findUserByIdAsync(userId);
  }

  async getUserAddressAsync(userId: number): Promise<string> {
    const user = await findUserByIdAsync(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user.address;
  }
}
