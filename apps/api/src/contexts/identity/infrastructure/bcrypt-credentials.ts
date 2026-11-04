import { Injectable } from '@nestjs/common';
import { compare, genSaltSync, hashSync } from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { CredentialPort } from '../application/identity.port';
@Injectable()
export class BcryptCredentials implements CredentialPort {
    hash(password: string) {
        return hashSync(password, genSaltSync(10));
    }
    compare(password: string, hash: string) {
        return compare(password, hash);
    }
    version(hash: string) {
        return createHash('sha256').update(hash).digest('hex');
    }
    referralCode() {
        return randomBytes(8).toString('hex');
    }
}
