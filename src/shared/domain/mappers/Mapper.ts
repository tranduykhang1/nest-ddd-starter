/**
 * Base interface for domain entity mappers
 * Maps between domain entities and persistence models
 */
export interface IMapper<TDomain, TPersistence> {
  toDomain(raw: TPersistence): TDomain;
  toPersistence(entity: TDomain): TPersistence;
}
