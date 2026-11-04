import { Injectable } from '@nestjs/common';
import { PrismaService } from '#Root/platform/prisma/prisma.service';
import { IdentityRepository, AccountRegistration } from '../application/identity.port';
@Injectable()
export class PrismaIdentityRepository implements IdentityRepository {
    constructor(private readonly prisma: PrismaService) {}
    find(loginOrEmail: string) {
        return this.prisma.user.findFirst({ where: { OR: [{ email: loginOrEmail }, { login: loginOrEmail }] } });
    }
    async exists(email: string, login: string) {
        return !!(await this.prisma.user.findFirst({ where: { OR: [{ email }, { login }] }, select: { login: true } }));
    }
    async replacePassword(email: string, passwd: string, passwordHash: string, gameHash: string) {
        const result = await this.prisma.user.updateMany({ where: { email, passwd }, data: { passwd: passwordHash, game_password_hash: gameHash } });
        return result.count === 1;
    }
    async verifyEmail(email: string, state: { email_verify: boolean; auth_ok: number; block: number }) {
        await this.prisma.user.update({ where: { email }, data: state });
    }
    async recordSession(login: string, ip: string, userAgent?: string) {
        await this.prisma.userSession.create({ data: { login, ip, user_agent: userAgent } });
    }
    async rewardReferral(code: string) {
        await this.prisma.user.updateMany({ where: { referral_code: code }, data: { referral_count: { increment: 1 } } });
    }
    async register({ ip, userAgent, ...account }: AccountRegistration) {
        await this.prisma.user.create({ data: { ...account, UserSession: { create: { ip, user_agent: userAgent } } } });
    }
}
