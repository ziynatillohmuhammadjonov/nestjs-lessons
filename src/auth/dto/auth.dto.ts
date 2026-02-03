import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail({}, { message: "Maydon email bo'lishi kerak" })
  email: string;

  @IsString({ message: "Maydon string bo'lish kerak" })
  @MinLength(4, { message: "Kamida 4 ta belgidan iborat bo'lishi kerak" })
  password: string;
}
