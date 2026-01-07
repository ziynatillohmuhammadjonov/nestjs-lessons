# Nestjsni o'rnatish ikki hili usulda bo'ladi
1-nesjs-cli orqali
2-tayyor gitdan klone qilish orqali

# kontrollerlar
ilovadagi aniq so'rovni qayta ishlab unga javob beradi. mashrutlash mexanizimi qaysi kontroller qaysi routni qayta ishlashini aniqlashtiradi. kontrollerni ochish uchun biz klass va dekoratorladan foydalanamiz. dekoratorlar kerakli klasslar metadatalari bilan bog'lanib, nestjsdan foydalanib xarita ochib kerakli so'rovni kontroller bilan bog'laydi.

crud-kontroller ochish uchun `nest g resource [name]` dan foydalaniladi.

- mashrutlash.
@controller() dekoratori zaruriy bo'lmagan prefiksdan foydalanib biz kodni takrorlanishini oldina olishimiz mumkin. ya'ni shunda biz kontroller ichidagi metodlar (routlarda) qayta yozib o'tirmaymiz. 

```ts
import { controller, get } from '@nestjs/common';

@controller('cats')
export class catscontroller {
  @get()
  findall(): string {
    return 'this action returns all cats';
  }
}
```

bitta kontrollerni nesjs-cli orqali ochish `nest g controller [name]`

Shunda controller ichidagi metodlarda ham ixtiyoriy prefiksdan foydalansak unda rout mos ravishda /cats/bread bo'ladi. 
