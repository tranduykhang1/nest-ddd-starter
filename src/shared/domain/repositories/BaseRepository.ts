/**
 * Base Domain Repository Interface
 * This interface is persistence-agnostic and works with domain entities
 */
export interface IBaseRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;

  save(entity: TEntity): Promise<TEntity>;

  delete(id: TId): Promise<void>;

  exists(id: TId): Promise<boolean>;

  findAll(options?: PaginationOptions): Promise<PaginatedResult<TEntity>>;

  count(): Promise<number>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
