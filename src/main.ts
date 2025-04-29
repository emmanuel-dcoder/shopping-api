import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisService } from './redis/redis.service';
// import { ProductService } from './product/product.service';
// import { seedProducts } from './core/config/seed-data';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // try {
  //   const productsService = app.get(ProductService);

  //   console.log('Seeding database...');

  //   // Seed products
  //   for (const product of seedProducts) {
  //     await productsService.create(product);
  //     console.log(`Seeded product: ${product.name}`);
  //   }

  //   console.log('Database seeding completed successfully!');
  // } catch (error) {
  //   console.error('Error seeding database:', error);
  // } finally {
  //   await app.close();
  // }

  app.enableCors({ origin: '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const redisService = app.get(RedisService);
  await redisService.connect();

  const config = new DocumentBuilder()
    .setTitle('Shopping Cart API')
    .setDescription('A scalable shopping cart system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const adapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(adapterHost));

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
