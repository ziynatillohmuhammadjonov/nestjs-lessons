# Testing ni turlari
Testingni 3 turi bor:
1 - e2e (end to end test) - to'liq yeg'ilgan tizimni test qiladi. API bilan yoki brauzer bilan
2 - Integration - ikki komponentni integratsiyasini yoki sistemani integratsiyasini test qilamiz. Bunda bizga albatta ikita tizim  kerak bo'ladi
3 - Unit - biz izolatsiya qilingan funksiya yoki classlarni metodlarini test qilamiz bunda bizga qo'shimcha narsalar kerak bo'lmaydi.

Nestjsda yuqoridagi testlar quyidagicha qo'llaniladi. Unit testlar odatda servis va controller uchun ishlatiladi. Integration test esa huddi e2e kabi bo'ladi faqat unda db mock bo'ladi. e2e test esa real data bilan butun tizimni ishga tushirib qilinadigan testlarga aytiladi. Unit va Integration testlar mos ravishda moule ichida e2e test esa root ichidagi test papkasida bo'ladi 

Nestjsda createDto ni ochib va uni yana update qilish o'rniga maxsus `@nestjs/mapped-types` paketini o'rnatib 
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```
shaklida alohida updateDto ochsa shunda dtoni va validatsiyani  to'liq yozishga hojat qolmaydi

mockReturnValue	Funksiya oddiy narsa qaytarsa	findById, find, limit, sort
mockResolvedValue	Funksiya Promise (async) bo'lsa	exec, create, save, countDocuments
mockRejectedValue	Xato (error) otmoqchi bo'lsangiz	exec (error bo'lganda), create (error)

Agar serviceda .exec() bo'lsa, mokingizda mockReturnValue({ exec: jest.fn().mockResolvedValue(...) }) konstruksiyasini ishlatish shart.

Unit test - bunda asosan faqat funksiya darajsidagi test bo'ladi. Ya'ni faqat bitta hech qanday bog'liqlik bo'lmagan funksiya testlanadi.
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { ProductModel } from './product.model';
import { CreateProductDto } from './dto/create-product-dto';
import { PRODUCT_CONSTANTS } from './product.constants';

describe('ProductService', () => {
  let service: ProductService;

  // dastlab mock data yasab olamiz ishlatish uchun
  const mockProduct = {
    image: 'https://example.com/image.png',
    title: 'MacBook Pro 14',
    link: 'https://example.com/macbook-pro-14',
    initialRating: 5,
    price: 2500,
    oldPrice: 2800,
    credit: 12,
    description: 'M3 Chip bilan taʼminlangan kuchli noutbuk',
    advantages: 'Tezkor ishlash, ajoyib displey',
    disAdvantages: 'Yuqori narx',
    categories: ['Noutbuklar', 'Apple'],
    tags: ['m3', 'pro', 'laptop'],
    characteristics: [
      {
        name: 'Protsessor',
        value: 'Apple M3 Pro',
      },
      {
        name: 'RAM',
        value: '18GB',
      },
    ],
  };

  // keyin mock model yasab olamiz sababi shunda biz dbga so'rov yubormaymiz
  const mockProductModel = {
    create: jest.fn().mockReturnValue(mockProduct),
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockProduct]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(ProductModel.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully add a product', async () => {
      const result = await service.create(mockProduct);
      expect(result).toEqual(mockProduct);

      //bu qator modelga to'g'ri ma'lumot yetib borganligini tasdiqlaydi
      expect(mockProductModel.create).toHaveBeenCalledWith(mockProduct);
    });
    it('should throw an error if DB creation fails', async () => {
      const wrongData = { ...mockProduct, title: '' } as CreateProductDto;

      // Model xato berishini "simulyatsiya" qilamiz
      mockProductModel.create.mockRejectedValueOnce(new Error('DB Error'));

      // Servis bu xatoni tashqariga otishini (rejects) tekshiramiz
      await expect(service.create(wrongData)).rejects.toThrow('DB Error');
    });
  });

  describe('getById', () => {
    it('should successfully return a product by id', async () => {
      const result = await service.getById('123');
      expect(result).toEqual(mockProduct);

      expect(mockProductModel.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if id is wrong', async () => {
      const id = 'wrongId';

      mockProductModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.getById(id)).rejects.toThrow(
        PRODUCT_CONSTANTS.NOT_FOUND,
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete a product', async () => {
      const id = '123';
      const result = await service.delete(id);
      expect(result).toEqual(mockProduct);

      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if product to delete is not found', async () => {
      const wrongId = 'wrong-id';

      //modelda hatoni throw qilib olamiz
      mockProductModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete(wrongId)).rejects.toThrow(
        PRODUCT_CONSTANTS.NOT_FOUND,
      );
    });
  });

  describe('edit', () => {
    it('should successfully edit a product', async () => {
      const result = await service.edit('123', mockProduct);
      expect(result).toEqual(mockProduct);

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { $set: mockProduct },
        { new: true },
      );

      // Moslashuvchanroq tekshirish
      // expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
      //   id,
      //   expect.objectContaining({ $set: mockProduct }),
      //   expect.any(Object),
      // );
    });
  });
});
```

2. Integration teslar esa product/product.integration.spec.ts da mock data bilan e2e darajsidagi test bo'ladi
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductModel } from './product.model';
import { App } from 'supertest/types';

describe('ProductController (Integration)', () => {
  let app: INestApplication<App>;

  // 1. Mock ma'lumotlar
  const mockProduct = {
    _id: '123',
    image: 'https://example.com/image.png',
    title: 'MacBook Pro 14',
    link: 'https://example.com/macbook-pro-14',
    initialRating: 5,
    price: 2500,
    oldPrice: 2800,
    credit: 12,
    description: 'M3 Chip bilan taʼminlangan kuchli noutbuk',
    advantages: 'Tezkor ishlash, ajoyib displey',
    disAdvantages: 'Yuqori narx',
    categories: ['Noutbuklar', 'Apple'],
    tags: ['m3', 'pro', 'laptop'],
    characteristics: [
      {
        name: 'Protsessor',
        value: 'Apple M3 Pro',
      },
      {
        name: 'RAM',
        value: '18GB',
      },
    ],
  };

  // 2. Mock Model (Bazaga murojaat qilmaslik uchun)
  const mockProductModel = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
    // boshqa metodlar...
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
    await app.init();
  });       

  describe('/product/create (POST)', () => {
    it('should create a product and return 201', () => {
      return request(app.getHttpServer())
        .post('/product/create')
        .send(mockProduct)
        .expect(201) // HTTP status
        .expect((res) => {
          expect(res.body).toEqual(mockProduct);
        });
    });
  });

  describe('/product/:id (GET)', () => {
    it('should return a product by id and return 200', () => {
      return request(app.getHttpServer())
        .get('/product/123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockProduct);
          expect(mockProductModel.findById).toHaveBeenCalledWith('123');
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

3. E2E testlar esa haqiqiy DB bilan qilinadigan integration testlar. Bu testlarni root ichdagi test papkasiga yozilib prefixida .e2e-spec.ts bilan tugashi kerak. Keyin bu turdagi testlar butun loyihani qamrab olgani uchun AppModule darajsida ishlanadi.
```ts
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
```
