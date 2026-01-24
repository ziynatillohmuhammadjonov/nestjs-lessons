import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductModel } from './product.model';
import { App } from 'supertest/types';
import { mockProduct } from './product.mock';

describe('ProductController (Integration)', () => {
  let app: INestApplication<App>;

  // 1. Mock ma'lumotlar
  // 2. Mock Model (Bazaga murojaat qilmaslik uchun)
  const mockProductModel = {
    create: jest.fn().mockResolvedValue(mockProduct),
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockProduct]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService, // Haqiqiy servisni beramiz
        {
          provide: getModelToken(ProductModel.name),
          useValue: mockProductModel, // Modelni esa mock qilamiz
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('/product/create (POST)', () => {
    it('should create a product and return 201', () => {
      return request(app.getHttpServer())
        .post('/product/create')
        .send(mockProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mockProduct);
        });
    });

    it('should throw new Excetion and return 400', () => {
      return request(app.getHttpServer())
        .post('/product/create')
        .send({ title: 'Test' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(Array.isArray(res.body.message)).toBeTruthy();
        });
    });
  });

  describe('/product/:id (GET)', () => {
    it('should return a product by id and return 200', () => {
      return request(app.getHttpServer())
        .get(`/product/${mockProduct._id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toEqual(mockProduct);
        });
    });
    it('should return not found and return 404', () => {
      // 1. Ushbu test uchun mockni vaqtincha "null" qaytaradigan qilamiz
      mockProductModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      // 2. Endi so'rov yuboramiz. ID valid bo'lishi kerak (MongoId formatida)
      // aks holda Pipe sizni 400 bilan to'xtatib qoladi.
      const validButNonExistentId = '65b123456789012345678901';
      return request(app.getHttpServer())
        .get(`/product/${validButNonExistentId}`)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
