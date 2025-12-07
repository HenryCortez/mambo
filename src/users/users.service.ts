// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { UserResponseDto } from './dto/user-res.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true
      }
    })
    return users.map(this.mapToUserResponse)
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true
      }
    })

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`)
    }

    return this.mapToUserResponse(user)
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.users.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        lastname: updateUserDto.lastname
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true
      }
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return this.mapToUserResponse(user)
  }
}
