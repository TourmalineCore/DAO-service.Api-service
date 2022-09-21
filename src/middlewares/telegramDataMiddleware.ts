import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';
import { User } from '../models/user';

@Injectable()
export class TelegramDataMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.headers.telegramdata) {
        throw new Error(`Telegram data cannot be empty`);
      }

      const telegramData = JSON.parse(req.headers.telegramdata.toString());
      const dataHash = this.buildDataHash(telegramData);

      if (dataHash != telegramData.hash) {
        throw new HttpException(
          'Telegram data is invalid',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const telegramUser = JSON.parse(telegramData.user);
      await this.updateUserInfoAsync(telegramUser);

      req.query.telegramUserId = telegramUser.id.toString();
      req.query.telegramUsername = telegramUser.username.toString();
      req.query.telegramUserFirstName = telegramUser.first_name.toString();
      req.query.telegramUserLastName = telegramUser.last_name.toString();
      next();
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private buildDataHash(telegramData: object): string {
    const dataCheckString = this.getDataCheckString(telegramData);

    const secret = createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_API_TOKEN)
      .digest();

    return createHmac('sha256', secret).update(dataCheckString).digest('hex');
  }

  private getDataCheckString(telegramData: object): string {
    return Object.keys(telegramData)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${telegramData[key]}`)
      .join('\n');
  }

  private async updateUserInfoAsync(telegramUser): Promise<void> {
    const user = await User.findByPk(telegramUser.id);

    if (!user) return;

    user.username = telegramUser.username;
    user.firstName = telegramUser.first_name;
    user.lastName = telegramUser.last_name;
    user.save();
  }
}
