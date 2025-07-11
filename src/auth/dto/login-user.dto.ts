import { IsEmail, IsString } from 'class-validator';

export class LoginUsersDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
