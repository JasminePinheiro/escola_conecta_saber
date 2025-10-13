import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '../../modules/auth/dto/auth.dto.js';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

