import { IsString, MaxLength } from 'class-validator';

export class UpdateWorkerSettingsDto {
  @IsString()
  @MaxLength(255)
  jobSearchTitle!: string;
}
