import { User } from '../models/user';

export async function updateUserAddressAsync(
  user: User,
  address: string,
): Promise<void> {
  user.address = address;
  await user.save();
}

export async function createUserAsync(
  userId: number,
  username: string,
  firstName: string,
  lastName: string,
): Promise<User> {
  return await User.create({
    id: userId,
    username,
    firstName,
    lastName,
  });
}
