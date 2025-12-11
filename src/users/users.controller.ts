// src/users/users.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Put,
  HttpStatus,
  UseGuards
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UserResponseDto } from './dto/user-res.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto], description: 'List of users' })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll()
  }

  @Get('email/:email')
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Retrieve a user by their email address'
  })
  @ApiParam({ name: 'email', description: 'Email address of the user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponseDto, description: 'User found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return this.usersService.findByEmail(email)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto, description: 'User data to update' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserResponseDto,
    description: 'User updated successfully'
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto)
  }
}
