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
