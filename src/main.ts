import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {  ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { CatPhaseModule } from './cat-phase/cat-phase.module';
import { BucketModule } from './bucket/bucket.module';
import { CustomerModule } from './customer/customer.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MaterialsModule } from './materials/materials.module';
import { EngineerHistoryModule } from './engineer-history/engineer-history.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { ProductPurchaseModule } from './product-purchase/product-purchase.module';
import { ProductTestingModule } from './product-testing/product-testing.module';
import { ProductSellModule } from './product-sell/product-sell.module';
import { DashboardModule } from './dashboard/dashboard.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use global pipes
  app.useGlobalPipes(new ValidationPipe( {
    whitelist: true,
    forbidNonWhitelisted: true,
    } 
  ))

  // Swagger module
  const options = new DocumentBuilder()
    .setTitle('CRM')
    .setDescription('The CRM API description')
    .setVersion('1.0')
    .addTag('CRM')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [AuthModule, UserModule, ProductModule, ProductPurchaseModule, ProductTestingModule, ProductSellModule, StoreModule, CatPhaseModule, BucketModule, CustomerModule, InvoiceModule, MaterialsModule, EngineerHistoryModule, ManufacturerModule, PurchaseOrderModule, DashboardModule],
  });
  SwaggerModule.setup('api', app, document);

  // CORS
  app.enableCors( {origin: '*'} )
  
  await app.listen(8000);
  
}
bootstrap();
