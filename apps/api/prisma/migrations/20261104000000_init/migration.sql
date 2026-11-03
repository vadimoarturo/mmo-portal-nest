BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[GameServer] (
    [server_name] NVARCHAR(1000) NOT NULL,
    [is_active] BIT NOT NULL,
    [version] NVARCHAR(1000) NOT NULL,
    [rate] NVARCHAR(1000) NOT NULL,
    [drop] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [GameServer_pkey] PRIMARY KEY CLUSTERED ([server_name])
);

-- CreateTable
CREATE TABLE [dbo].[PayProviderBonus] (
    [id] INT NOT NULL IDENTITY(1,1),
    [provider] NVARCHAR(1000) NOT NULL,
    [amount] NVARCHAR(1000) NOT NULL,
    [percent] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PayProviderBonus_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PayProvider] (
    [provider] NVARCHAR(1000) NOT NULL,
    [is_active] BIT NOT NULL CONSTRAINT [PayProvider_is_active_df] DEFAULT 1,
    [icon] NVARCHAR(1000) NOT NULL,
    [rate] NVARCHAR(1000) NOT NULL,
    [min] NVARCHAR(1000) NOT NULL,
    [haveCommission] BIT NOT NULL,
    CONSTRAINT [PayProvider_pkey] PRIMARY KEY CLUSTERED ([provider]),
    CONSTRAINT [PayProvider_provider_key] UNIQUE NONCLUSTERED ([provider])
);

-- CreateTable
CREATE TABLE [dbo].[OrderTransaction] (
    [id] NVARCHAR(1000) NOT NULL,
    [provider_id] NVARCHAR(1000),
    [date_order] DATETIME2 NOT NULL CONSTRAINT [OrderTransaction_date_order_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(1000) NOT NULL,
    [login] NVARCHAR(1000) NOT NULL,
    [amount] NVARCHAR(1000) NOT NULL,
    [amount_credits] NVARCHAR(1000) NOT NULL,
    [rate] NVARCHAR(1000) NOT NULL,
    [currency] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [OrderTransaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HistoryTopUp] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date_top_up] DATETIME2 NOT NULL CONSTRAINT [HistoryTopUp_date_top_up_df] DEFAULT CURRENT_TIMESTAMP,
    [login] NVARCHAR(1000) NOT NULL,
    [current_balance] NVARCHAR(1000) NOT NULL,
    [updated_balance] NVARCHAR(1000) NOT NULL,
    [method] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [HistoryTopUp_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HistoryBuy] (
    [id] INT NOT NULL IDENTITY(1,1),
    [login] NVARCHAR(1000) NOT NULL,
    [date_buy] DATETIME2 NOT NULL CONSTRAINT [HistoryBuy_date_buy_df] DEFAULT CURRENT_TIMESTAMP,
    [server_name] NVARCHAR(1000) NOT NULL,
    [item_id] INT NOT NULL CONSTRAINT [HistoryBuy_item_id_df] DEFAULT 0,
    [service_id] INT NOT NULL CONSTRAINT [HistoryBuy_service_id_df] DEFAULT 0,
    [game_item_id] NVARCHAR(1000) NOT NULL CONSTRAINT [HistoryBuy_game_item_id_df] DEFAULT '',
    [count] INT NOT NULL,
    [item_count] INT NOT NULL,
    [item_price] NVARCHAR(1000) NOT NULL,
    [item_total_price] NVARCHAR(1000) NOT NULL,
    [current_balance] NVARCHAR(1000) NOT NULL,
    [updated_balance] NVARCHAR(1000) NOT NULL,
    [is_refund] BIT NOT NULL CONSTRAINT [HistoryBuy_is_refund_df] DEFAULT 0,
    CONSTRAINT [HistoryBuy_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ShopCategory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [category_id] NVARCHAR(1000) NOT NULL,
    [is_active] BIT NOT NULL CONSTRAINT [ShopCategory_is_active_df] DEFAULT 1,
    [server_name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ShopCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ShopCategory_category_id_server_name_key] UNIQUE NONCLUSTERED ([category_id],[server_name])
);

-- CreateTable
CREATE TABLE [dbo].[ShopService] (
    [service_id] INT NOT NULL IDENTITY(1,1),
    [is_active] BIT NOT NULL CONSTRAINT [ShopService_is_active_df] DEFAULT 1,
    [info] NVARCHAR(1000) NOT NULL,
    [price] NVARCHAR(1000) NOT NULL,
    [sale] NVARCHAR(1000),
    [icon] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000),
    [server_name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ShopService_pkey] PRIMARY KEY CLUSTERED ([service_id])
);

-- CreateTable
CREATE TABLE [dbo].[ShopItem] (
    [item_id] INT NOT NULL,
    [is_active] BIT NOT NULL CONSTRAINT [ShopItem_is_active_df] DEFAULT 1,
    [icon] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000),
    [info] NVARCHAR(1000) NOT NULL,
    [category_id] NVARCHAR(1000) NOT NULL,
    [server_name] NVARCHAR(1000) NOT NULL,
    [price] NVARCHAR(1000) NOT NULL,
    [sale] NVARCHAR(1000),
    [game_id] INT,
    [game_id_set] NVARCHAR(1000),
    [item_count] INT NOT NULL,
    [is_stack] BIT NOT NULL,
    [level] NVARCHAR(1000),
    [life_time] NVARCHAR(1000),
    [life_type] NVARCHAR(1000) NOT NULL,
    [is_move] BIT NOT NULL,
    [is_set] BIT NOT NULL,
    CONSTRAINT [ShopItem_pkey] PRIMARY KEY CLUSTERED ([item_id])
);

-- CreateTable
CREATE TABLE [dbo].[UserSession] (
    [id] INT NOT NULL IDENTITY(1,1),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserSession_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [ip] NVARCHAR(1000) NOT NULL,
    [user_agent] NVARCHAR(1000) NOT NULL,
    [login] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [UserSession_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [account_id] INT NOT NULL IDENTITY(1,1),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [auth_ok] INT NOT NULL CONSTRAINT [users_auth_ok_df] DEFAULT 0,
    [block] INT NOT NULL CONSTRAINT [users_block_df] DEFAULT 1,
    [email_verify] BIT NOT NULL CONSTRAINT [users_email_verify_df] DEFAULT 0,
    [email] NVARCHAR(1000) NOT NULL,
    [login] NVARCHAR(1000) NOT NULL,
    [passwd] NVARCHAR(1000) NOT NULL,
    [game_password_hash] NVARCHAR(1000) NOT NULL,
    [server_idx_offset] INT NOT NULL CONSTRAINT [users_server_idx_offset_df] DEFAULT 0,
    [last_login_server_idx] INT NOT NULL CONSTRAINT [users_last_login_server_idx_df] DEFAULT 0,
    [balance] NVARCHAR(1000) NOT NULL CONSTRAINT [users_balance_df] DEFAULT '0',
    [current_balance] NVARCHAR(1000) NOT NULL CONSTRAINT [users_current_balance_df] DEFAULT '0',
    [referral_parent] NVARCHAR(1000),
    [referral_code] NVARCHAR(1000) NOT NULL,
    [referral_count] INT NOT NULL CONSTRAINT [users_referral_count_df] DEFAULT 0,
    [gift_guild] BIT NOT NULL CONSTRAINT [users_gift_guild_df] DEFAULT 0,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([account_id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [users_login_key] UNIQUE NONCLUSTERED ([login]),
    CONSTRAINT [users_referral_code_key] UNIQUE NONCLUSTERED ([referral_code])
);

-- CreateTable
CREATE TABLE [dbo].[OrderAuction] (
    [id] INT NOT NULL IDENTITY(1,1),
    [login] NVARCHAR(1000) NOT NULL,
    [login_buy] NVARCHAR(1000),
    [server_name] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [gold] NVARCHAR(1000) NOT NULL,
    [credits] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [date_create] DATETIME2 NOT NULL CONSTRAINT [OrderAuction_date_create_df] DEFAULT CURRENT_TIMESTAMP,
    [date_buy] DATETIME2,
    [date_closed] DATETIME2,
    CONSTRAINT [OrderAuction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PayProviderBonus_provider_idx] ON [dbo].[PayProviderBonus]([provider]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PayProvider_provider_is_active_idx] ON [dbo].[PayProvider]([provider], [is_active]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ShopCategory_category_id_is_active_idx] ON [dbo].[ShopCategory]([category_id], [is_active]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ShopItem_category_id_is_active_item_id_server_name_idx] ON [dbo].[ShopItem]([category_id], [is_active], [item_id], [server_name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_email_login_idx] ON [dbo].[users]([email], [login]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_login_idx] ON [dbo].[users]([login]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [users_referral_code_idx] ON [dbo].[users]([referral_code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [OrderAuction_login_idx] ON [dbo].[OrderAuction]([login]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [OrderAuction_login_status_idx] ON [dbo].[OrderAuction]([login], [status]);

-- AddForeignKey
ALTER TABLE [dbo].[PayProviderBonus] ADD CONSTRAINT [PayProviderBonus_provider_fkey] FOREIGN KEY ([provider]) REFERENCES [dbo].[PayProvider]([provider]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[OrderTransaction] ADD CONSTRAINT [OrderTransaction_login_fkey] FOREIGN KEY ([login]) REFERENCES [dbo].[users]([login]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[OrderTransaction] ADD CONSTRAINT [OrderTransaction_provider_fkey] FOREIGN KEY ([provider]) REFERENCES [dbo].[PayProvider]([provider]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HistoryTopUp] ADD CONSTRAINT [HistoryTopUp_login_fkey] FOREIGN KEY ([login]) REFERENCES [dbo].[users]([login]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HistoryBuy] ADD CONSTRAINT [HistoryBuy_login_fkey] FOREIGN KEY ([login]) REFERENCES [dbo].[users]([login]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HistoryBuy] ADD CONSTRAINT [HistoryBuy_server_name_fkey] FOREIGN KEY ([server_name]) REFERENCES [dbo].[GameServer]([server_name]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShopCategory] ADD CONSTRAINT [ShopCategory_server_name_fkey] FOREIGN KEY ([server_name]) REFERENCES [dbo].[GameServer]([server_name]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShopService] ADD CONSTRAINT [ShopService_server_name_fkey] FOREIGN KEY ([server_name]) REFERENCES [dbo].[GameServer]([server_name]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShopItem] ADD CONSTRAINT [ShopItem_category_id_server_name_fkey] FOREIGN KEY ([category_id], [server_name]) REFERENCES [dbo].[ShopCategory]([category_id],[server_name]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ShopItem] ADD CONSTRAINT [ShopItem_server_name_fkey] FOREIGN KEY ([server_name]) REFERENCES [dbo].[GameServer]([server_name]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserSession] ADD CONSTRAINT [UserSession_login_fkey] FOREIGN KEY ([login]) REFERENCES [dbo].[users]([login]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[OrderAuction] ADD CONSTRAINT [OrderAuction_login_fkey] FOREIGN KEY ([login]) REFERENCES [dbo].[users]([login]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OrderAuction] ADD CONSTRAINT [OrderAuction_login_buy_fkey] FOREIGN KEY ([login_buy]) REFERENCES [dbo].[users]([login]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OrderAuction] ADD CONSTRAINT [OrderAuction_server_name_fkey] FOREIGN KEY ([server_name]) REFERENCES [dbo].[GameServer]([server_name]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

