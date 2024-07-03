import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/roles/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createDefaultRoles() {
    const roles = ['admin', 'employee', 'accountant'];
    for (const roleName of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!existingRole) {
        const newRole = this.roleRepository.create({ name: roleName });
        await this.roleRepository.save(newRole);
      }
    }
  }

  async createDefaultAdmin() {
    const email = 'admin@admin.com';
    const role = 'admin';
    const defaultPassword = 'password';

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name = :roleName', { roleName: role })
      .getMany();

    const adminRole = await this.roleRepository.findOne({
      where: { name: role },
    });

    if (users.length === 0 && adminRole) {
      const newUser = this.userRepository.create({
        email,
        name: 'admin',
        password: defaultPassword,
        roles: [adminRole],
      });

      try {
        await newUser.hashPassword();
        await this.userRepository.save(newUser);
      } catch (error) {
        console.error('Error creating default admin:', error.message);
        throw error;
      }
    }
  }
}
