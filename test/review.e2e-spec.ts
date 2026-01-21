import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { CreateReviewDto } from 'src/review/dto/create-review.dto';
import { disconnect, Types } from 'mongoose';
import { REVIEW_CONSTANTS } from 'src/review/review.constants';

const productId = new Types.ObjectId().toHexString();

const testDto: CreateReviewDto = {
  name: 'Test',
  title: 'Test title',
  description: 'Test description',
  raitig: 5,
  productId,
};

describe('ReviewController (e2e)', () => {
  let app: INestApplication<App>;
  let createId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/review/create (POST)', () => {
    return request(app.getHttpServer())
      .post('/review/create')
      .send(testDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        createId = body._id;
        expect(createId).toBeDefined();
      });
  });

  it('/review/byProduct/:productId (GET)', () => {
    return request(app.getHttpServer())
      .get(`/review/byProduct/${productId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.length).toBeGreaterThan(0);
      });
  });

  it('/review/:id (DELETE WRONG)', () => {
    return request(app.getHttpServer())
      .delete(`/review/${createId}22`)
      .expect(502)
      .then(({ body }: request.Response) => {
        console.log(body);
        expect(body.message).toBe(REVIEW_CONSTANTS.BAD_GETWAY);
      });
  });

  it('/review/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/review/${createId}`)
      .expect(200);
  });

  it('/review/byProduct/:productId/delete (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/review/byProduct/${productId}/delete`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });
});
