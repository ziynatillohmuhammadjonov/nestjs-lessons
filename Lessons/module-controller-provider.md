 Modullar
Qurilish bloklari ilovani qurish uchun ishlatiladigan. Odatda nestjs hech bo'lmagasnda bitta moduldan tuzilgan bo'ladi. Odatda modullar subdomenlar bo'yicha qilinadi.
Modullar bitta domenni bog'liqliklarini o'zida birlashtiradi:
```ts
@Module({
    imports:[],  // Boshqa modullardan qilinadigan importlarni kiritiladi.
    controllers:[AppController],
    providers:[AppService], // Servislar, repozitorylar, boshqa providerlar
    exports:[]  // Eksport qilinadigan providerlar yoki reeksport modullar 
    })
```
Nega providerlar - qachonki ilova build qilinganda u dekoratorlarni o'qib ichidagi hamma qiymatlarni olib ularni sozlaydi. Agar modul ichda bo'lmadsa uni ishlatmaydi yoki qatnashmaydi ilovada.
- Modullarni import qilish usullari:
1. Oddiy import
2. Takroriy import 
    ```ts
    @Module({
        imports: [CommonModule],
        exports: [CommonModule]
        })
    export class AppModule {}
    ```
3. Global modullar - bunda modullar bir joyda export qilinib istalgan joyda ishlatilinishi mumkin. Misol db bilan ishlaydigan modullar shunday qilinadi.
    ```ts
    @Global()
    @Module({
        imports:[],
        controllers:[AppController],
        providers:[AppService],
        })
    export class MyModule { }
    ```
4. Dinamik modull - ko'pincha hollarda biz modullarni faqat import qilmasdan uni ichida qo'shimcha narslar portlar ulanishlarni ham yuborish kerak misol db modulida. Shunda Dinamik modul ishlatiladi.
    ```ts
    @Module({
        imports:[],
        providers:[],
        exports:[],
        }) 
    export class MyModule(
        static forRoot(connection:string):DynamicModule{
            const providers = createDatabaseProvifers(connection);
            return {
                module: MyModule,
                providers:providers,
                exports:providers
            };
        }
    )
    // uni ishlatilinishi
    @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[AppService]
        })
    export class AppModule { }
    ```
Modelni ochish uchun `nest g class <model-name>`

# Kontroller
Kontrollerlar -  so'rovlarni kirish nuqtasi bo'lib u so'rovlarni qayrelarga borishni hal qiladi. Va kerakli javobni mijozga qayta yuboradi.
Nestjs da global prefiksni routga qo'yish `app.setGlobalPrefix('api)`
Nestjsda argument dekoratorlari quydagicha:
```ts
@Req() - so'rov obyekt
@Res() - javob obyekt
---------------------------
@Params(key?:string) - so'rovni matn parametri
@Body(key?:string) - so'rov tanasi
@Query(key?:strin) - query parametrlari
@Header(name?:string) - sarlavhasi so'rovni
@Session() - sessiyasi foydalanuvchini
@HttpCode(201) - o'zimizni kodimizni yuboramiz
@Header('Cache-Control', 'none ')
@Redirect('https://mydomain.ru',301)
@Controller({host:'domen'}) - domenni cheklash
```
Nestjsda kontrolleni ochish uchun `nest g controller <controller-name> `

# DTO - data transfer object
DTO - bu bizni metodga keladigan bodyni ma'lumotlarini yozadigan klass
 

# Providerlar
Providerlar - bu klass yoki qiymat yoki fabrika yoki boshqa funksiyalar bo'lib birgalikda servislar contrrollerlarni quradi. Biror ishni qiladigan funksiyalar hisoblanadi. Misol 
```ts
import {Injectable} from '@nestjs-common';

@Injectable()  // shu dekkorator classni provayder sifatida ko'rsatadi build vaqtida
export class AppService{
    getHello(){
        return 'Hello World';
    }
}
// ishlatish uchun dastalb modulda ko'rsatib olamiz 
   @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[AppService]
        })
    export class AppModule { }


// keyin kontrollerda DI bilan ishlatamiz
@Controller()
export class AppController {
    constructor(private readonly appServise:AppService){}
}
```
 Providerlarni 4 turi mavjud:
1. useClass - bunda yuqorida ko'rganimiz
2. useFactory - bunda uni boshqa klasslarni generatsiya qilishda foydalaniladi
3. useValue - bunda qiymatlarni butun loyiha bo'yicha ishlatishim mumkin misol db ga ulanishniki
4. useExistig - bunda mavjud providerni yo'naltirib boshqa psevdonimda ishlatish 
- useClass provayder
```ts
   @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[AppService]
        })
    export class AppModule { }

    @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[{
            provider:AppService,
            useClass:AppService
        }]
        })
    export class AppModule { }
```
- useValue - bu testlarda ishlashga qulay misol dbni imitatsiya qilganda 
```ts
const myValue = {}
   @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[{
            provider:AppService,
            useValue:myValue
        }]
        })
    export class AppModule { }
```
```ts
const myValue = {}
   @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[{
            provider:'MY_VALUE',
            useValue:myValue
        }]
        })
    export class AppModule { }
    
    @Controller()
    export class AppController {
        constructor (@Inject('MY_VALUE') myValue:any){}
    }
```
- useFactory - buni biz db ni joriy qilish kabi holatlarda ishlatsak bo'ladi. Misol dbni bira to'la ulaydiagn qatorni ham ishlatsak bo'ladi.
```ts
const myValue = {}
   @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[{
            provider:'MY_FACTORY',
            useFactory:(otherServise:OtherServise)=>{
                const res = otherServise.loadSomethings();
                return new CustomFactory(res);
            }
            inject:[OtherServise]
        }]
        })
    export class AppModule { }
```
- useExisting - bunda bir o'zimizdagi servisni boshqa nom bilan nomlab qayta ishlatish
```ts
const myValue = {}
   @Module({
        imports:[MyModule.forRoot('connection')],
        controllers:[AppController],
        providers:[{
            provider:'OtherServiseName',
            useExisting:AppService
        }]
        })
    export class AppModule { }
```

# Bajarilish scope lari (chegaralari)
Scope turlari: Default; Request; Transient;
- Default - bu butun loyiha bo'yicha bitta instanse bo'lishini anglatadi provayderni. Bu `Singleton Pattern`
```ts
@Injectable()
// @Injectable({scope:Scope.DEFAULT})
export class GenerateService {
    constructor(private readonly appServise:AppService) {}
}
```

- Request - bunda har bir so'rov alohida yangi instanse ochadi.
```ts
@Injectable({scope:Scope.REQUEST})
export class GenerateService {
    constructor(private readonly appServise:AppService) {}
}
```

- Transient - kim shuni inject qilsa unga alohida instanse oladi. 
```ts
@Injectable({scope:Scope.TRANSIENT})
export class GenerateService {
    constructor(private readonly appServise:AppService) {}
}
```
Bu tushunchalarni farqlash uchun bitta misol yetarli: tasavvur qiling, bizda bitta Controller bor va unga ikkita Service (masalan, AuthService va LogService) inject qilingan.

Ikkala servisning ichida esa bitta GenerateService (Scope o'rnatilgan servis) ishlatiladi.

1. Request Scope (So'rov doirasi)
Qoida: Bitta HTTP so'rov kirib kelganida, o'sha so'rovning ichidagi hamma joyda bitta umumiy obyekt (instance) ishlatiladi.

Natija: AuthService va LogService ikkalasi ham aynan bitta GenerateService obyektidan foydalanadi.

Vaziyat: Foydalanuvchi so'rov yubordi → NestJS yangi GenerateService ochdi → Uni barcha joyga tarqatdi → So'rov tugadi → Obyekt o'chirildi.

2. Transient Scope (Vaqtinchalik/O'tkinchi doira)
Qoida: Kim bu servisni "so'rasa" (inject qilsa), unga alohida, yangi obyekt beriladi. Ular bir-biri bilan bog'liq bo'lmaydi.

Natija: AuthService uchun bitta alohida GenerateService ochiladi, LogService uchun esa yana bitta boshqa yangi GenerateService ochiladi.

Vaziyat: Controller ichida ikkita servis bormi? Demak, xotirada ikkita alohida GenerateService nusxasi paydo bo'ladi.
Xususiyat,Request Scope,Transient Scope
Instance soni,Har bir so'rov uchun 1 ta,Har bir inject qiluvchi uchun 1 ta
O'zaro bog'liqlik,Servislar bir xil ma'lumotni ko'radi,"Har bir servis o'zining ""shaxsiy"" nusxasiga ega"
Xotira (Memory),Kamroq joy oladi,Ko'proq joy olishi mumkin
Ishlatish maqsadi,"Foydalanuvchi ma'lumotlarini (token, ID) so'rov davomida saqlash",Bir-biriga bog'liq bo'lmagan mustaqil hisob-kitoblar
