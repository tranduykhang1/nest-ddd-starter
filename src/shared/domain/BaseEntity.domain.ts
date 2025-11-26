export abstract class BaseEntityDomain {
  id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  deleted_at: string | null = null;

  isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  getCreatedBy() {
    return;
  }
  getUpdatedBy() {
    return;
  }
}
