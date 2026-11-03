import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { UserModule } from '#User/user.module';

@Module({
    imports: [UserModule],
    providers: [AuctionService],
    controllers: [AuctionController],
    exports: [AuctionService],
})
export class AuctionModule {}
