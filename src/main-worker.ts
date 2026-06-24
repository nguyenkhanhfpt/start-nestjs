import { NestFactory } from '@nestjs/core';
import { WorkerModule } from '@worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  // Start the app
  await app.init();
  console.log('Worker is running...');

  return app;
}
bootstrap();
