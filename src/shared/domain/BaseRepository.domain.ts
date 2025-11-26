import { FilterQuery, QueryOptions } from 'mongoose';
import { BaseEntityDomain } from './BaseEntity.domain';

export interface IBaseDomainRepository<T> {
  create(entity: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  fineByCondition(
    filter: FilterQuery<T>,
    options: QueryOptions<T>,
  ): Promise<T | null>;
  updateById(id: string, updateData: FilterQuery<T>): Promise<T | null>;
  updateByCondition(
    filter: FilterQuery<T>,
    updateData: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null>;
  deleteById(id: string): Promise<void>;
  deleteByCondition(filter: FilterQuery<T>): Promise<void>;
  findAll(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T[]>;
  count(filter: FilterQuery<T>): Promise<number>;
  findAllAndCount(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<{ data: T[]; count: number }>;
}
