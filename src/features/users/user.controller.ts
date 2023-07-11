import { Body, Controller, Get, Request, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserInfoDto } from 'src/core/dtos';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    private userUseCases: UserUseCases,
    private userFactoryService: UserFactoryService,
  ) {}

  @Get()
  async getById(@Request() request) {
    return this.userUseCases.getUserById(request.user.id);
  }

  @Put()
  updateUserInfo(@Request() request, @Body() updateUserDto: UpdateUserInfoDto) {
    const user = this.userFactoryService.getUserFromUpdateDto(updateUserDto);

    return this.userUseCases.updateUser(request.user.id, user);
  }
}
