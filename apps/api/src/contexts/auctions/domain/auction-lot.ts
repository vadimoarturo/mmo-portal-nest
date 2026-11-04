import { Money } from '#Root/shared/domain/money';
import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient, GameServerName } from '#Root/shared/domain/enum/index';
export interface LotSnapshot {
    id: number;
    login: string;
    credits: string;
    gold: string;
    status: string;
    server_name: GameServerName;
}
export class AuctionLot {
    constructor(readonly data: Readonly<LotSnapshot>) {}
    static validateListing(gold: string, credits: string) {
        const amount = Number(gold);
        const price = Money.parse(credits);
        if (!/^\d+$/.test(gold) || !Number.isSafeInteger(amount) || amount < 1000000 || amount > 9000000000 || price.lessThan(Money.parse('1'))) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.MIN_AMOUNT });
        }
        return { gold: amount, price };
    }
    private active() {
        if (this.data.status !== 'active') {
            AuctionLot.unavailable();
        }
    }
    buy(buyer: string) {
        this.active();
        if (this.data.login === buyer) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_OWN });
        }
        return { ...this.data, status: 'completed', buyer };
    }
    cancel(owner: string) {
        this.active();
        if (this.data.login !== owner) {
            AuctionLot.unavailable();
        }
        return { ...this.data, status: 'canceled' };
    }
    static unavailable(): never {
        throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.AUCTION_LOT_NOT_FOUND });
    }
}
