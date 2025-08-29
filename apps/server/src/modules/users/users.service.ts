import type {
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '@kamf/interface/types/common.js';
import type { User, CreateUserDto, UpdateUserDto } from '@kamf/interface/types/user.js';
import { UserRole } from '@kamf/interface/types/user.js';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      role: UserRole.ADMIN,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      email: 'user@example.com',
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      isActive: true,
      role: UserRole.USER,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  async findAll(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    const { page = 1, limit = 10 } = params;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUsers = this.users.slice(startIndex, endIndex);
    const total = this.users.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        data: paginatedUsers,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<ApiResponse<User>> {
    const user = this.users.find(u => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      success: true,
      data: user,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    return {
      success: true,
      data: newUser,
      message: 'User created successfully',
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
    const userIndex = this.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;

    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    const userIndex = this.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
