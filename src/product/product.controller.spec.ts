import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product-dto';
import { UpdateProductDto } from './dto/update-product-dto';
import { FindProductDto } from './dto/find-product.dto';

describe('ProductController', () => {
  let controller: ProductController;

  // 1. Mock ma'lumot (xuddi servisdagidek)
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

  // 2. Mock Service (Service metodlarini poylab turadi) Bu yerda mockProductService metodlarida nomi Servisdagi nomlar bilan bir xil bo'lishi shart (masalan: getById, edit)
  const mockProductService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    getById: jest.fn().mockResolvedValue(mockProduct),
    edit: jest.fn().mockResolvedValue(mockProduct),
    filter: jest.fn().mockResolvedValue([mockProduct]),
    delete: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const result = await controller.create(mockProduct);
      expect(result).toEqual(mockProduct);

      expect(mockProductService.create).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('getById', () => {
    it('should call service.getById with correct id', async () => {
      const result = await controller.get('123');
      expect(result).toEqual(mockProduct);

      expect(mockProductService.getById).toHaveBeenCalledWith('123');
    });
  });

  describe('delete', () => {
    it('should call service.delete and return deleted product', async () => {
      const result = await controller.delete('123');

      expect(result).toEqual(mockProduct);
      expect(mockProductService.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('patch', () => {
    it('should call service.edit with id and dto', async () => {
      const updateData: UpdateProductDto = {
        ...mockProduct,
        link: undefined,
      };
      const result = await controller.patch('123', updateData);

      expect(result).toEqual(mockProduct);

      expect(mockProductService.edit).toHaveBeenCalledWith('123', updateData);
    });
  });

  describe('find', () => {
    it('should call service.filter and return array', async () => {
      const findData: FindProductDto = {
        category: 'Noutbuklar',
        limit: 10,
      };
      const result = await controller.find(findData);

      expect(result).toEqual([mockProduct]);
      expect(mockProductService.filter).toHaveBeenCalledWith(findData);
    });
  });
});
