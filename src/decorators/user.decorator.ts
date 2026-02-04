import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserModel } from 'src/auth/user.model';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    {
      const request: Request = ctx.switchToHttp().getRequest();
      return request.user as UserModel;
    }
  },
);
