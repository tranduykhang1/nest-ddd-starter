import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { IMapper } from '../../domain/mappers/Mapper';
import {
  IBaseRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../domain/repositories/BaseRepository';

/**
 * @typeParam TDomain - Domain entity type
 * @typeParam TModel - Mongoose model type
 */
export abstract class BaseMongoRepository<TDomain, TModel>
  implements IBaseRepository<TDomain, string>
{
  constructor(
    protected readonly model: Model<TModel>,
    protected readonly mapper: IMapper<
      TDomain,
      TModel | Record<string, unknown>
    >,
  ) {}

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.mapper.toDomain(doc as TModel) : null;
  }

  async save(entity: TDomain): Promise<TDomain> {
    const data = this.mapper.toPersistence(entity);
    const id =
      (data as Record<string, unknown>).id ||
      (data as Record<string, unknown>)._id;

    if (id) {
      const updated = await this.model
        .findByIdAndUpdate(id, data as FilterQuery<TModel>, { new: true })
        .lean()
        .exec();
      return this.mapper.toDomain(updated as TModel);
    } else {
      const created = await this.model.create(data);
      return this.mapper.toDomain(created.toObject() as TModel);
    }
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model
      .countDocuments({ _id: id } as FilterQuery<TModel>)
      .exec();
    return count > 0;
  }

  async findAll(
    options?: PaginationOptions,
  ): Promise<PaginatedResult<TDomain>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, 1 | -1> = {};
    if (options?.sortBy) {
      sortOptions[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    }

    const [docs, total] = await Promise.all([
      this.model
        .find({} as FilterQuery<TModel>)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments({} as FilterQuery<TModel>).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapper.toDomain(doc as TModel)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async count(): Promise<number> {
    return this.model.countDocuments({} as FilterQuery<TModel>).exec();
  }

  protected async findOneByCondition(
    filter: FilterQuery<TModel>,
    options?: QueryOptions<TModel>,
  ): Promise<TDomain | null> {
    const doc = await this.model.findOne(filter, null, options).lean().exec();
    return doc ? this.mapper.toDomain(doc as TModel) : null;
  }

  protected async findManyByCondition(
    filter: FilterQuery<TModel>,
    options?: QueryOptions<TModel>,
  ): Promise<TDomain[]> {
    const docs = await this.model.find(filter, null, options).lean().exec();
    return docs.map((doc) => this.mapper.toDomain(doc as TModel));
  }

  protected async updateOneByCondition(
    filter: FilterQuery<TModel>,
    updateData: Partial<TModel>,
    options?: QueryOptions<TModel>,
  ): Promise<TDomain | null> {
    const doc = await this.model
      .findOneAndUpdate(filter, updateData as FilterQuery<TModel>, {
        new: true,
        ...options,
      })
      .lean()
      .exec();
    return doc ? this.mapper.toDomain(doc as TModel) : null;
  }

  protected async deleteManyByCondition(
    filter: FilterQuery<TModel>,
  ): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount || 0;
  }

  protected async countByCondition(
    filter: FilterQuery<TModel>,
  ): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
