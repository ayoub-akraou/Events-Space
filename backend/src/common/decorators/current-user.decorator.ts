import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Request } from 'express';

export type CurrentUserPayload = {
  userId: string;
  email: string;
  role: Role;
  fullName?: string | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: CurrentUserPayload }>();
    return request.user;
  },
);
