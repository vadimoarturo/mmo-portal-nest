import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class EnotGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const allowedIps = new Set(['109.206.163.80', '31.133.209.40', '23.88.5.163', '23.88.5.156']);
        if (!allowedIps.has(request.ip)) {
            return false;
        }

        const signature = request.headers['x-api-sha256-signature'];
        const secret = process.env.ENOT_SECRET_TWO;
        if (!secret || typeof signature !== 'string' || !/^[a-f\d]{64}$/i.test(signature)) {
            return false;
        }
        if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
            return false;
        }

        // ENOT signs compact JSON with sorted top-level keys. Nested fields must survive serialization.
        const sortedBody = Object.fromEntries(Object.entries(request.body).sort(([a], [b]) => a.localeCompare(b, 'en')));
        const digest = createHmac('sha256', secret).update(JSON.stringify(sortedBody), 'utf8').digest();
        return timingSafeEqual(Buffer.from(signature, 'hex'), digest);
    }
}
