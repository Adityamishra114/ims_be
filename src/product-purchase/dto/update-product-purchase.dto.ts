import { PartialType } from '@nestjs/swagger';
import { CreateProductPurchaseDto } from './create-product-purchase.dto';

export class UpdateProductPurchaseDto extends PartialType(CreateProductPurchaseDto) {}
