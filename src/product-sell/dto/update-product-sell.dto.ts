import { PartialType } from '@nestjs/swagger';
import { CreateProductSellDto } from './create-product-sell.dto';

export class UpdateProductSellDto extends PartialType(CreateProductSellDto) {}
