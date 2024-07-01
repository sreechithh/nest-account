import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async createDefaultRoles() {
    const roles = ['admin', 'employee', 'accountant'];
    for (const roleName of roles) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!role) {
        const newRole = this.roleRepository.create({ name: roleName });
        await this.roleRepository.save(newRole);
      }
    }
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }
}
