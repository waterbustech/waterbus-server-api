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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationListQuery, UpdateUserInfoDto } from 'src/core/dtos';
import { UserFactoryService } from './user-factory.service';
import { UserUseCases } from './user.usecase';

@ApiTags('user')
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

  @ApiOperation({
    summary: 'Search user',
    description: 'Search user by username or fullname',
  })
  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationListQuery,
  ) {
    return this.userUseCases.searchUsers(query, pagination);
  }

  @ApiOperation({
    summary: 'Fetch user info',
    description: 'Retrieve your info by access token',
  })
  @Get()
  async getById(@Request() request) {
    return this.userUseCases.getUserById(request.user.id);
  }

  @ApiOperation({
    summary: 'Check username',
    description: 'Check username is available for change',
  })
  @Get('username/:userName')
  async checkUserNameExists(@Param('userName') userName: string) {
    const user = await this.userUseCases.getUserByUserName(userName);

    return {
      isRegistered: user != null,
    };
  }

  @ApiOperation({
    summary: 'Update user info',
    description: 'Update your info',
  })
  @Put()
  updateUserInfo(@Request() request, @Body() updateUserDto: UpdateUserInfoDto) {
    const user = this.userFactoryService.getUserFromUpdateDto(updateUserDto);

    return this.userUseCases.updateUser(request.user.id, user);
  }

  @ApiOperation({
    summary: 'Update username',
    description: 'Update your username',
  })
  @Put('username/:userName')
  updateUserName(@Request() request, @Param('userName') userName: string) {
    return this.userUseCases.updateUserName({
      userId: request.user.id,
      userName,
    });
  }
}
