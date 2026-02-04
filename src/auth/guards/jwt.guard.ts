import { AuthGuard } from '@nestjs/passport';

// quyidagi jwt bu strategy e'lon qilinganda uni ichiga berilgan Strategy ni default qilymati. Uni custom qilsa ham bo'ladi.
export class JwtAuthGuard extends AuthGuard('jwt') {}
