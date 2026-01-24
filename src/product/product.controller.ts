import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { FindProductDto } from './dto/find-product.dto';
import { CreateProductDto } from './dto/create-product-dto';
import { ProductService } from './product.service';
import { UpdateProductDto } from './dto/update-product-dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.productService.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.edit(id, dto);
  }

  @UsePipes()
  @HttpCode(200)
  @Post()
  async find(@Body() dto: FindProductDto) {
    return this.productService.filter(dto);
  }
}
