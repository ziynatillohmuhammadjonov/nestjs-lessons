import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductCharacteristicDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsString()
  image: string;

  @IsString()
  title: string;

  @IsUrl({}, { message: 'Link noto‘g‘ri formatda' })
  link: string;

  @IsNumber()
  initialRating: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  oldPrice?: number;

  @IsNumber()
  credit: number;

  @IsString()
  description: string;

  @IsString()
  advantages: string;

  @IsOptional()
  @IsString()
  disAdvantages?: string;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductCharacteristicDto)
  characteristics: ProductCharacteristicDto[];
}
