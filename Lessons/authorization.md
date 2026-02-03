Dastlab userni ro'yxatdan o'tkazish uchun uni bazaga saqalaymiz. Bunda userni ma'lumotlarini ochiq holda qoldirmaslik uchun misol password qatorini uni bcrypt qilish kerak. Buning uchun `bcryptjs` paketini loyihaga o'rnatamiz.
Avvallari mijoz saytga kirganda unga session key berilib shu asosida bekend bilan ishlar edi. Lekin keyinchalik SPA ishlagandan keyin sahifaga faqat http so'rovlar berishni boshlagandan keyin session ishlamay qoldi va shunda JWT keldi. JWT uch qisimdan iborat:
1. Algoritm va kontent turi
2. Malumot bizniki
3. Imzo

JWT ni ishlatish uchun nestda o'zini paketini o'rnatiladi `@nestjs/jwt` keyin uni kerakli modelga inject qilib servisda ishlatiladi. Shunda biz jwt imzoni tekshiradi va u asosida ishlaydi. Agar imzo mos kelmasa xatolik berib 401 berib yuboradi.

Endi uni routlarni tokenni olib ishlash uchun strategiya qilinadi. Buni qo'shimcha paket orqali qilamiz. `@nestjs/passport passport passport-jwt` ts uchun esa `-D @types/passport-jwt`. Keyin dastlab kerakli modulga `PassportModule` ni import qilamiz.  
