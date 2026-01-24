import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product-dto';
import { ProductModel } from './product.model';
import { UpdateProductDto } from './dto/update-product-dto';
import { FindProductDto } from './dto/find-product.dto';
import { PRODUCT_CONSTANTS } from './product.constants';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductModel.name)
    private readonly productModel: Model<ProductModel>,
  ) {}

  async getById(id: string): Promise<ProductModel | null> {
    const result = await this.productModel.findById(id).exec();
    if (!result) {
      throw new NotFoundException(PRODUCT_CONSTANTS.NOT_FOUND);
    }
    return result;
  }

  async create(dto: CreateProductDto): Promise<ProductModel> {
    return this.productModel.create(dto);
  }

  async delete(id: string): Promise<ProductModel | null> {
    const deleteProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleteProduct) {
      throw new NotFoundException(PRODUCT_CONSTANTS.NOT_FOUND);
    }
    return deleteProduct;
  }

  async edit(id: string, dto: UpdateProductDto): Promise<ProductModel | null> {
    const newProduct = await this.productModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!newProduct) {
      throw new NotFoundException(PRODUCT_CONSTANTS.NOT_FOUND);
    }
    return newProduct;
  }

  async filter(dto: FindProductDto): Promise<ProductModel[]> {
    return this.productModel
      .find({ categories: dto.category })
      .limit(dto.limit)
      .exec();
  }
}
