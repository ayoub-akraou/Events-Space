import { Body, Controller, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch(':id/role')
  updateRole(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateRoleDto) {
    return this.users.updateRole(id, dto.role);
  }
}
