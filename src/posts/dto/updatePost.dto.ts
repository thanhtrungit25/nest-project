import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class UpdatePostDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsString({ each: true })
  @IsNotEmpty()
  @IsOptional()
  paragraphs: string[];
}

export default UpdatePostDto;
