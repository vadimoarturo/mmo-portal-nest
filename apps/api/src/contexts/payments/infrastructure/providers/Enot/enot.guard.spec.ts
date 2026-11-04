import { EnotGuard } from '#Root/contexts/payments/infrastructure/providers/Enot/enot.guard';
import { ExecutionContext } from '@nestjs/common';

// Public test vector from the provider's webhook signing documentation.
const body = {
    order_id: 'c78d8fe9-ab44-3f21-a37a-ce4ca269cb47',
    credited: '95.50',
    custom_fields: { user: 1 },
    invoice_id: 'a3e9ff6f-c5c1-3bcd-854e-4bc995b1ae7a',
    pay_service: 'card',
    pay_time: '2023-04-06 16:27:59',
    payer_details: '553691******1279',
    status: 'success',
    type: 1,
    amount: '100.00',
};
const signature = 'e582b14dd13f8111711e3cb66a982fd7bff28a0ddece8bde14a34a5bb4449136';
const context = (data = body, sign: unknown = signature, ip = '109.206.163.80') =>
    ({
        switchToHttp: () => ({ getRequest: () => ({ ip, headers: { 'x-api-sha256-signature': sign, 'x-real-ip': '109.206.163.80' }, body: data }) }),
    }) as unknown as ExecutionContext;

describe('ENOT webhook authentication', () => {
    const original = process.env.ENOT_SECRET_TWO;
    beforeEach(() => {
        process.env.ENOT_SECRET_TWO = 'example';
    });
    afterAll(() => {
        if (original === undefined) delete process.env.ENOT_SECRET_TWO;
        else process.env.ENOT_SECRET_TWO = original;
    });
    it('accepts the vendor signature including nested custom fields', () => expect(new EnotGuard().canActivate(context())).toBe(true));
    it('rejects a modified payment amount', () => expect(new EnotGuard().canActivate(context({ ...body, amount: '999.00' }))).toBe(false));
    it.each(['', 'not-hex', 'ab', ['a', 'b']])('rejects malformed signatures without throwing: %s', (value) =>
        expect(new EnotGuard().canActivate(context(body, value))).toBe(false),
    );
    it('does not trust an IP address supplied through a header', () => expect(new EnotGuard().canActivate(context(body, signature, '203.0.113.1'))).toBe(false));
});
