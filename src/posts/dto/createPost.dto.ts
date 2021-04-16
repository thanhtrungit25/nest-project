import { IsNotEmpty, IsString } from 'class-validator';

class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export default CreatePostDto;
