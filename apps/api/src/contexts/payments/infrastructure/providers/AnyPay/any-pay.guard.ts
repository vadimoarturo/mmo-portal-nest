import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as md5 from 'md5';

@Injectable()
export class AnyPayGuard implements CanActivate {
    constructor() {}
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;
        const allowedIps = ['185.162.128.38', '185.162.128.39', '185.162.128.88'];
        const allowedIpsSet = new Set(allowedIps);
        const isAllowedIp = allowedIpsSet.has(ip);
        if (!isAllowedIp) {
            return false;
        }
        const { merchant_id, amount, pay_id, sign } = request.body;
        const secret = process.env.ANYPAY_SECRET;
        const isAllowedSign = md5(merchant_id + ':' + amount + ':' + pay_id + ':' + secret) === sign;
        return isAllowedSign;
    }
}
