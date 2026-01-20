import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

class ProductCharecteristic {
  name: string;
  value: string;
}

export type ProductType = HydratedDocument<ProductModel>;

@Schema({ timestamps: true, collection: 'Product' })
export class ProductModel {
  @Prop({ required: true })
  image: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  link: string;
  @Prop({ required: true })
  initialRating: number;
  @Prop({ required: true })
  price: number;
  @Prop({ required: true })
  oldPrice?: number;
  @Prop({ required: true })
  credit: number;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  advantages: string;
  @Prop({ required: false })
  disAdvantages?: string;
  @Prop({ required: true })
  categories: string[];
  @Prop({ required: true, type: () => [String] })
  tags: string[];
  @Prop({ type: () => [ProductCharecteristic], required: true })
  characteristics: ProductCharecteristic[];
}

export const ProductSchema = SchemaFactory.createForClass(ProductModel);
