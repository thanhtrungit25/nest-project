import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class UpdatePostDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content: string;
}

export default UpdatePostDto;
