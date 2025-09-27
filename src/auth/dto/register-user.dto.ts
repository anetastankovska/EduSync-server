import { IsEnum, IsOptional } from 'class-validator';
import { LoginUsersDto } from './login-user.dto';
import { Role } from 'src/util/role.enum';

export class RegisterUserDto extends LoginUsersDto {
  @IsEnum(Role)
  @IsOptional()
  role: Role = Role.Student;
}
