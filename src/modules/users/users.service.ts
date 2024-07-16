import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions, In } from 'typeorm';
import { Role, UserRoles } from '../roles/entities/role.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Company } from '../company/entities/company.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}
  async create(user: User, createUserInput: CreateUserInput) {
    const {
      name,
      email,
      password,
      role: inputRole,
      companyId,
    } = createUserInput;
    const role = await this.roleRepository.findOneBy({ name: inputRole });
    let company;

    if (!role) {
      throw new NotFoundException(`${inputRole} not found`);
    }
    if (
      user.roles.some((role) => role.name === UserRoles.ACCOUNTANT) &&
      inputRole !== UserRoles.EMPLOYEE
    ) {
      throw new UnauthorizedException(`Unauthorized action`);
    }

    if (inputRole === UserRoles.EMPLOYEE) {
      if (!companyId) {
        throw new NotFoundException('CompanyId not found');
      }
      company = await this.companyRepository.findOneBy({ id: companyId });

      if (!company) {
        throw new Error('company not found');
      }
    }
    const userEntity = this.usersRepository.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      roles: [role],
      createdBy: user,
      updatedBy: user,
    });
    const newUser = await this.usersRepository.save(userEntity);

    if (inputRole === UserRoles.EMPLOYEE) {
      if (!newUser) {
        throw new Error('user not found');
      }

      const staff = this.staffRepository.create({
        user: newUser,
        company,
      });
      await this.staffRepository.save(staff);
    }

    return 'Created successfully';
  }

  async findAll(
    perPage: number,
    page: number,
    isActive?: boolean | null,
    role?: string | null,
  ): Promise<User[]> {
    const options: FindManyOptions<User> = {
      take: perPage,
      skip: (page - 1) * perPage,
      relations: ['roles', 'staff', 'createdBy', 'updatedBy', 'transactions'],
      where: {},
    };

    if (isActive === true) {
      options.where = { ...options.where, isActive };
    }

    if (role) {
      const roleEntity = await this.roleRepository.findOneBy({ name: role });

      if (!roleEntity || roleEntity.name === UserRoles.ADMIN) {
        throw new NotFoundException(`role ${role} not found`);
      }
    }

    options.where = {
      ...options.where,
      roles: {
        name: In(role ? [role] : [UserRoles.EMPLOYEE, UserRoles.ACCOUNTANT]),
      },
    };

    return this.usersRepository.find(options);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async update(user: User, updateUserInput: UpdateUserInput) {
    const {
      id,
      name,
      email,
      password,
      role: inputRole,
      companyId,
      isActive,
    } = updateUserInput;
    const loginUser = { email: user.email, id: user.id } as User;
    const userToUpdate = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const role = await this.roleRepository.findOneBy({ name: inputRole });
    let company;

    if (!role) {
      throw new NotFoundException(`${inputRole} not found`);
    }

    if (
      user.roles.some((role) => role.name === UserRoles.ACCOUNTANT) &&
      inputRole !== UserRoles.EMPLOYEE
    ) {
      throw new UnauthorizedException(`Unauthorized action`);
    }

    if (inputRole === UserRoles.EMPLOYEE) {
      if (!companyId) {
        throw new NotFoundException('CompanyId not found');
      }
      company = await this.companyRepository.findOneBy({ id: companyId });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (password) userToUpdate.password = await bcrypt.hash(password, 10);
    userToUpdate.roles = [role];
    userToUpdate.updatedBy = loginUser;
    userToUpdate.isActive = isActive;

    const updatedUser = await this.usersRepository.save(userToUpdate);

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    let staff = await this.staffRepository.findOneBy({
      user: { id: updatedUser.id } as User,
    });

    if (staff) {
      await this.staffRepository.remove(staff);
    }

    if (inputRole === UserRoles.EMPLOYEE) {
      staff = this.staffRepository.create({ user: updatedUser, company });
      await this.staffRepository.save(staff);
    }

    return 'Updated successfully';
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOne(options: FindOneOptions<User>): Promise<User | null> {
    return this.usersRepository.findOne(options);
  }
}
