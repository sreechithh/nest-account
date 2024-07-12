import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Role, UserRoles } from '../roles/entities/role.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Company } from '../company/entities/company.entity';

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

    if (!role) {
      throw new NotFoundException(`${inputRole} not found`);
    }
    if (
      user.roles.some((role) => role.name === UserRoles.ACCOUNTANT) &&
      inputRole !== UserRoles.EMPLOYEE
    ) {
      throw new UnauthorizedException(`Unauthorized to do this`);
    }

    this.usersRepository.create({
      name,
      email,
      password,
      roles: [role],
    });
    const newUser = this.usersRepository.save(user);

    // if (inputRole === UserRoles.EMPLOYEE) {
    //   if (!companyId) {
    //     throw new NotFoundException('CompanyId not found');
    //   }
    //
    //   if (!newUser) {
    //     throw new Error('user not found');
    //   }
    //   const company = await this.companyRepository.findOneBy({ id: companyId });
    //   this.staffRepository.create({
    //     user: newUser,
    //     company,
    //   });
    // }

    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOne(options: FindOneOptions<User>): Promise<User | null> {
    return this.usersRepository.findOne(options);
  }
}
