import { DomainError } from '#Root/shared/domain/domain-error';
import { ErrorCodeClient } from '#Root/shared/domain/enum/index';

export interface TradingStatus {
    exists: boolean;
    hasStorage: boolean;
    online: boolean;
}
export class TradingEligibility {
    static require(status: TradingStatus) {
        if (!status.exists) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.CHARACTER_NOT_FOUND });
        }
        if (!status.hasStorage) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.STOCK_ROOM_NOT_OPEN });
        }
        if (status.online) {
            throw new DomainError({ type: 'CLIENT', code: ErrorCodeClient.SELECT_CHARACTER_EXIT });
        }
    }
}
