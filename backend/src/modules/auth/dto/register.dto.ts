import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
	@Transform(({ value }) => value?.trim())
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	name: string;

	@Transform(({ value }) => value?.trim().toLowerCase())
	@IsEmail()
	@MaxLength(200)
	email: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password: string;
}
