import { IsNumberString } from 'class-validator';

export class UserInfoDTO {
    @IsNumberString()
    readonly currentBalance: string;
}
