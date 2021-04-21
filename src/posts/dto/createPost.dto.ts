import { IsNotEmpty, IsString } from 'class-validator';

class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString({ each: true })
  @IsNotEmpty()
  paragraphs: string[];
}

export default CreatePostDto;
