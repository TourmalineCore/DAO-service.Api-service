import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /* This is a temporary redirection that is only necessary to use the web interface.
   * When we remove ngrok, please remove this redirect
   */
  @Get()
  @Redirect('http://localhost:3000', 301)
  getHello(): string {
    return this.appService.getHello();
  }
}
