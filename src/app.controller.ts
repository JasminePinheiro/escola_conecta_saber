import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('mongo-status')
  async checkHealth() {
    const mongoStatus = this.connection.readyState;
    
    return {
      status: mongoStatus === 1 ? 'healthy' : 'unhealthy',
      mongodb: mongoStatus === 1 ? 'connected' : 'disconnected'
    };
  }
}
