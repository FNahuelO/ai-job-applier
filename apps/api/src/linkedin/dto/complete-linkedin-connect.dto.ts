import { IsObject } from 'class-validator';

export class CompleteLinkedInConnectDto {
  @IsObject()
  storageState!: Record<string, unknown>;
}
