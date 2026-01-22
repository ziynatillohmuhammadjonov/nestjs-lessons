import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { REVIEW_CONSTANTS } from './review.constants';
import { Types } from 'mongoose';

describe('ReviewController (Integration)', () => {
  let controller: ReviewController;
  let service: ReviewService;

  // Mock Service obyekti
  const mockReviewService = {
    create: jest.fn(),
    delete: jest.fn(),
    findByProductId: jest.fn(),
    deleteProductByProductId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('delete', () => {
    it('notogri ObjectId yuborilganda BAD_GATEWAY (502) qaytarishi kerak', async () => {
      const invalidId = '123-not-valid';

      try {
        await controller.delete(invalidId);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
        expect(err.getResponse()).toBe(REVIEW_CONSTANTS.BAD_GETWAY);
      }
    });

    it('ID topilmasa NOT_FOUND (404) xatosini tashlashi kerak', async () => {
      const validId = new Types.ObjectId().toHexString();
      // Service null qaytarishini simulyatsiya qilamiz
      jest.spyOn(service, 'delete').mockResolvedValue(null);

      try {
        await controller.delete(validId);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('Togri ID berilsa ochirilgan hujjatni qaytarishi kerak', async () => {
      const validId = new Types.ObjectId().toHexString();
      const mockDeletedDoc = { _id: validId, title: 'Ochirilgan' };

      jest.spyOn(service, 'delete').mockResolvedValue(mockDeletedDoc as any);

      const result = await controller.delete(validId);
      expect(result).toEqual(mockDeletedDoc);
      expect(service.delete).toHaveBeenCalledWith(validId);
    });
  });

  describe('getByProduct', () => {
    it('ProductId boyicha massiv qaytarishi kerak', async () => {
      const productId = 'prod-123';
      const mockResult = [{ productId, title: 'Yaxshi' }];

      jest
        .spyOn(service, 'findByProductId')
        .mockResolvedValue(mockResult as any);

      const result = await controller.getByProduct(productId);
      expect(result).toEqual(mockResult);
      expect(result).toBeInstanceOf(Array);
    });
  });
});
