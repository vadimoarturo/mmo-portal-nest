import { ConfigService as NestConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ConfigType } from '#Root/platform/config/config';

@Injectable()
export class ConfigService extends NestConfigService<ConfigType> {
    get<K extends keyof ConfigType>(key: K): ConfigType[K] {
        return super.get<ConfigType[K]>(key);
    }
}
