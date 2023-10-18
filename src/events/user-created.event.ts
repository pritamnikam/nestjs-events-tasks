export class UserCreatedEvent {
  constructor(
    private readonly userId: string,
    private readonly email: string,
  ) {}

  mail(): string {
    return this.email;
  }
}
