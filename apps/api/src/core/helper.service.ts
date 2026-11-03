import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';

@Injectable()
export class HelperService {
    private readonly format = 'YYYY-MM-DD[T]HH:mm:ss.SSS';

    getServerTime(): moment.Moment {
        return moment.tz('Europe/Moscow');
    }

    getStringTime(time: moment.Moment): string {
        return time.format(this.format);
    }

    getOneMonthTime(time: moment.Moment): string {
        return time.clone().add(1, 'month').format(this.format);
    }
}
