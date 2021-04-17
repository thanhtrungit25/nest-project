import { IsNotEmpty, IsString } from 'class-validator';

class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export default CreateCategoryDto;
