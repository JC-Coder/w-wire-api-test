import { IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  fromCurrency: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  toCurrency: string;
}
