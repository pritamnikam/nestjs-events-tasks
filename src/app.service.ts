import { Injectable, Logger } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { UserCreatedEvent } from './events/user-created.event';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly shedulerRegistry: SchedulerRegistry,
  ) {}

  private readonly logger: Logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(dto: CreateUserRequestDto) {
    this.logger.log('Creating user...', dto);

    // add to persistent store and emit event

    const userId = '123';
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(userId, dto.email),
    );

    const establishWsTimeout = setTimeout(
      () => this.establishWsConnection(userId),
      5000,
    );

    this.shedulerRegistry.addTimeout(
      `${userId}_establish_ws`,
      establishWsTimeout,
    );
  }

  private establishWsConnection(userId: string) {
    this.logger.log('Establishing user WS connection...', userId);
  }

  @OnEvent('user.created')
  async welcomeNewUser(payload: UserCreatedEvent) {
    this.logger.log('Welcoming new user...', payload.mail());
  }

  @OnEvent('user.created', { async: true })
  async SendWelcomeGift(payload: UserCreatedEvent) {
    this.logger.log('Sending Welcome gift...', payload.mail());

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));

    this.logger.log('Welcome gift sent...');
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'delete-expired-users' })
  deleteExpiredUsers() {
    this.logger.log('Deleting expired users...');
  }
}
