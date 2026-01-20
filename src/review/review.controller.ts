import { DeleteResult, Model } from 'mongoose';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { REVIEW_CONSTANTS } from './review.constants';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('created')
  async created(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const delDoc = await this.reviewService.delete(id);
    if (!delDoc) {
      throw new HttpException(REVIEW_CONSTANTS.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return delDoc;
  }

  @Get('byProduct/:productId')
  async getByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProductId(productId);
  }

  @Delete('byProduct/:productId/delet')
  async deleteProductByProductId(
    @Param('productId') productId: string,
  ): Promise<DeleteResult> {
    return this.reviewService.deleteProductByProductId(productId);
  }
}
