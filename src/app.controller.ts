import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AppService } from '@app.service';
import { Public } from '@decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @Version(VERSION_NEUTRAL)
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('trigger-posts/:count')
  @Version(VERSION_NEUTRAL)
  triggerCreatePosts(@Param('count', ParseIntPipe) count: number) {
    return this.appService.triggerCreatePosts(count);
  }
}
