import { DeleteResult, isValidObjectId } from 'mongoose';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { REVIEW_CONSTANTS } from './review.constants';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UserModel } from 'src/auth/user.model';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  async created(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new HttpException(
        REVIEW_CONSTANTS.BAD_GETWAY,
        HttpStatus.BAD_GATEWAY,
      );
    }
    const delDoc = await this.reviewService.delete(id);
    if (!delDoc) {
      throw new HttpException(REVIEW_CONSTANTS.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return delDoc;
  }

  @UseGuards(JwtAuthGuard)
  @Get('byProduct/:productId')
  async getByProduct(
    @Param('productId') productId: string,
    @CurrentUser() user: UserModel,
  ) {
    console.log(user);
    return this.reviewService.findByProductId(productId);
  }

  @Delete('byProduct/:productId/delete')
  async deleteProductByProductId(
    @Param('productId') productId: string,
  ): Promise<DeleteResult> {
    return this.reviewService.deleteProductByProductId(productId);
  }
}
