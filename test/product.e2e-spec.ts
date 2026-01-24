import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { disconnect, Types } from 'mongoose';
import { AppModule } from 'src/app.module';
import { mockProduct } from 'src/product/product.mock';

describe('ReviewModel (e2e)', () => {
  let app: INestApplication<App>;
  let createId: string;
  const fakeId: string = new Types.ObjectId().toHexString();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('create', () => {
    it('should create and return 201', () => {
      const { _id, ...allData } = mockProduct;
      return request(app.getHttpServer())
        .post('/product/create')
        .send(allData)
        .expect((res) => {
          expect(res.body).toBeDefined();
          createId = res.body._id as string;
        })
        .expect(201);
    });

    it('should throw new ValidationException and return 400', () => {
      const { _id, link, ...allData } = mockProduct;
      return request(app.getHttpServer())
        .post('/product/create')
        .send(allData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });
  });

  describe('delete', () => {
    it('should delete and return object', () => {
      const { _id, ...allData } = mockProduct;
      return request(app.getHttpServer())
        .delete(`/product/${createId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject(allData);
        });
    });

    it('should throw new Exception and return 404', () => {
      return request(app.getHttpServer())
        .delete(`/product/${fakeId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toEqual('Not Found');
        });
    });
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });
});
