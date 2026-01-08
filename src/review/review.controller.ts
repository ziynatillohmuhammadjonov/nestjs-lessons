import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewModel } from './review.model';

@Controller('review')
export class ReviewController {
  @Post('created')
  async created(@Body() dto: ReviewModel) {}

  @Get(':id')
  async get(@Param('id') id: string) {}

  @Get('byProduct/:productId')
  async getByProduct(@Param(':productId') productId: string) {}
}
