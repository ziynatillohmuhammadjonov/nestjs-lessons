import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getModelToken } from '@nestjs/mongoose';
import { ReviewModel } from './review.model';
import { Types } from 'mongoose';

describe('ReviewService', () => {
  let service: ReviewService;

  // Test uchun namunaviy ma'lumot
  const mockReview = {
    _id: new Types.ObjectId().toHexString(),
    name: 'Test',
    title: 'Test title',
    description: 'Test description',
    rating: 5,
    productId: '123',
  };

  // To'liq Mock model
  const mockReviewModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),

    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockReview]),
    }),

    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReview),
    }),

    deleteMany: jest.fn().mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getModelToken(ReviewModel.name),
          useValue: mockReviewModel,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 1. Create testi
  it('should create a review', async () => {
    const res = await service.create(mockReview as any);
    expect(res).toEqual(mockReview);
  });

  // 2. findByProductId testi
  it('should find reviews by product id', async () => {
    const res = await service.findByProductId('123');
    expect(res).toEqual([mockReview]);
    expect(mockReviewModel.find).toHaveBeenCalledWith({ productId: '123' });
  });

  // 3. Delete (by Id) testi
  it('should delete review by id', async () => {
    const res = await service.delete(mockReview._id);
    expect(res).toEqual(mockReview);
  });

  // 4. deleteProductByProductId (deleteMany) testi
  it('should delete all reviews for a product', async () => {
    const res = await service.deleteProductByProductId('123');
    expect(res.deletedCount).toBe(1);
    expect(res.acknowledged).toBe(true);
  });
});
