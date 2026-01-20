import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TopPageType = HydratedDocument<TopPageModel>;

export enum TopLevelCategory {
  Courses,
  Services,
  Books,
  Products,
}
export class hHData {
  count: number;
  juniorSalary: number;
  middleSalary: number;
  seniorSalary: number;
}
export class TopPageAdvantges {
  title: string;
  description: string;
}
@Schema({ timestamps: true, collection: 'TopPage' })
export class TopPageModel {
  @Prop({ required: true, enum: TopLevelCategory })
  firstCateogory: TopLevelCategory;
  @Prop()
  secondCategory: string;
  @Prop({ unique: true })
  alias: string;
  @Prop()
  title: string;
  @Prop({ type: () => hHData })
  hh?: hHData;
  @Prop({ type: () => [TopPageAdvantges] })
  advantages: TopPageAdvantges[];
  @Prop()
  seoText: string;
  @Prop()
  tagsTitle: string;
  @Prop({ type: () => [String] })
  tags: string[];
}

export const TopPageSchema = SchemaFactory.createForClass(TopPageModel);
