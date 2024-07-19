import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';

// Define the type of args.object
interface ArgsObject {
  id: number; // Adjust the type according to your actual GraphQL mutation
  [key: string]: any; // Allow other properties as needed
}

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args: ValidationArguments) {
    const entity = args.constraints[0];
    const property = args.property;
    const id = (args.object as ArgsObject).id ?? null;
    const repo = this.entityManager.getRepository(entity);
    let queryBuilder = repo.createQueryBuilder('entity');
    queryBuilder = queryBuilder.where(`entity.${property} = :value`, { value });

    if (id) {
      queryBuilder = queryBuilder.andWhere('entity.id != :id', { id });
    }
    const count = await queryBuilder.getCount();

    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be unique.`;
  }
}

export function IsUnique(entity: any, validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity],
      validator: IsUniqueConstraint,
    });
  };
}
