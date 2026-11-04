import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as md5 from 'md5';

@Injectable()
export class FreeKassaGuard implements CanActivate {
    constructor() {}
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;
        const allowedIps = ['168.119.157.136', '168.119.60.227', '178.154.197.79', '51.250.54.238'];
        const allowedIpsSet = new Set(allowedIps);
        const isAllowedIp = allowedIpsSet.has(ip);
        if (!isAllowedIp) {
            return false;
        }
        const { MERCHANT_ID, AMOUNT, MERCHANT_ORDER_ID, SIGN } = request.body;
        const isAllowedSign = md5(MERCHANT_ID + ':' + AMOUNT + ':' + process.env.FREEKASSA_SECRET_TWO + ':' + MERCHANT_ORDER_ID) === SIGN;
        return isAllowedSign;
    }
}
