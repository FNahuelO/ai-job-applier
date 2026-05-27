import { IsString, MaxLength } from 'class-validator';

export class FailLinkedInConnectDto {
  @IsString()
  @MaxLength(500)
  error!: string;
}
