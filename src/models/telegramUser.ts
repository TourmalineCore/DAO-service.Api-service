export class TelegramUser {
  public readonly id: number;

  private readonly _firstName: string;
  private readonly _lastName: string | null;
  private readonly _username: string | null;

  constructor(
    id: number,
    firstName: string,
    lastName: string | null,
    username: string | null,
  ) {
    this.id = id;
    this._firstName = firstName;
    this._lastName = lastName;

    if (username) {
      this._username = username.startsWith('@') ? username : `@${username}`;
    }
  }

  get username(): string {
    if (this._username) {
      return this._username;
    }

    if (!this._lastName) {
      return this._firstName;
    }

    return `${this._firstName} ${this._lastName}`;
  }
}
