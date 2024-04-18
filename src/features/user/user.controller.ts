import {
  Body,
  Controller,
  Get,
  Request,
  Put,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { PaginationListQuery, UpdateUserInfoDto } from 'src/core/dtos';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';

@ApiBearerAuth()
@ApiSecurity('api_key', ['api_key'])
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

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationListQuery,
  ) {
    return this.userUseCases.searchUsers(query, pagination);
  }

  @Get()
  async getById(@Request() request) {
    return this.userUseCases.getUserById(request.user.id);
  }

  @Get('username/:userName')
  async checkUserNameExists(@Param('userName') userName: string) {
    const user = await this.userUseCases.getUserByUserName(userName);

    return {
      isRegistered: user != null,
    };
  }

  @Put()
  updateUserInfo(@Request() request, @Body() updateUserDto: UpdateUserInfoDto) {
    const user = this.userFactoryService.getUserFromUpdateDto(updateUserDto);

    return this.userUseCases.updateUser(request.user.id, user);
  }

  @Put('username/:userName')
  updateUserName(@Request() request, @Param('userName') userName: string) {
    return this.userUseCases.updateUserName({
      userId: request.user.id,
      userName,
    });
  }
}
