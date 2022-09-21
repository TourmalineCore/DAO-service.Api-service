import { TelegramUser } from './telegramUser';

describe('telegram user model', function () {
  it("should return username if it's not null", function () {
    const telegramUser = new TelegramUser(
      1056327991,
      'Ivan',
      'Invanov',
      'ivan',
    );

    expect('@ivan').toBe(telegramUser.username);
  });

  it('should return firstname with lastname if username is null', function () {
    const telegramUser = new TelegramUser(1056327991, 'Ivan', 'Ivanov', null);

    expect('Ivan Ivanov').toBe(telegramUser.username);
  });

  it('should return firstname if lastname and username are null', function () {
    const telegramUser = new TelegramUser(1056327991, 'Ivan', null, null);

    expect('Ivan').toBe(telegramUser.username);
  });
});
