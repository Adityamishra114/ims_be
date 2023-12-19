import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { CatPhaseModule } from './cat-phase/cat-phase.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { isAuthenticated } from './app.middleware';
import { JwtModule } from '@nestjs/jwt';
import { CustomerModule } from './customer/customer.module';
import { BucketModule } from './bucket/bucket.module';
import { BuyerModule } from './buyer/buyer.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MaterialsModule } from './materials/materials.module';
import { EngineerHistoryModule } from './engineer-history/engineer-history.module';
import { ProductSellModule } from './product-sell/product-sell.module';
import { ProductTestingModule } from './product-testing/product-testing.module';
import { ProductPurchaseModule } from './product-purchase/product-purchase.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StagesModule } from './stages/stages.module';
import { TimeModule } from './time/time.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    DatabaseModule,
    AuthModule, 
    UserModule, 
    ProductModule, 
    StoreModule, 
    CatPhaseModule,
    JwtModule,
    CustomerModule,
    BucketModule,
    BuyerModule,
    InvoiceModule,
    MaterialsModule,
    EngineerHistoryModule,
    ProductSellModule,
    ProductTestingModule,
    ProductPurchaseModule,
    ManufacturerModule,
    PurchaseOrderModule,
    DashboardModule,
    StagesModule,
    TimeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude({path: "/auth/login", method: RequestMethod.POST})
      .forRoutes('*')
}
}
// export class AppModule {}