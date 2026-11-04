"""Generate the repository's original, dependency-free SVG documentation assets."""
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'docs' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
BG, PANEL, LINE, TEXT, MUTED, GREEN = '#080c15', '#111822', '#493e2b', '#f4e7d2', '#a99f90', '#d8b879'

def text(x, y, value, size=18, color=TEXT, weight=400):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}">{escape(value)}</text>'

def box(x, y, w, h, title, lines=(), accent=GREEN):
    content = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{PANEL}" stroke="{LINE}"/>'
    content += f'<rect x="{x+20}" y="{y+22}" width="4" height="22" rx="2" fill="{accent}"/>'
    content += text(x+36, y+40, title, 21, TEXT, 600)
    for i, line in enumerate(lines): content += text(x+24, y+76+i*26, line, 16, MUTED)
    return content

def arrow(x1, y1, x2, y2, label='', dx=0, dy=-12):
    value = f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{GREEN}" stroke-width="2" marker-end="url(#arrow)"/>'
    if label: value += text((x1+x2)/2+dx, (y1+y2)/2+dy, label, 13, MUTED)
    return value

def save(name, w, h, title, subtitle, body):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(subtitle)}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 9 4.5 0 9" fill="{GREEN}"/></marker></defs>
<rect width="{w}" height="{h}" rx="24" fill="{BG}"/>
<g font-family="Inter,Segoe UI,Arial,sans-serif">{text(48,50,'MMO-PORTAL / ENGINEERING',12,GREEN,700)}{text(48,98,title,32,TEXT,600)}{text(48,132,subtitle,17,MUTED)}{body}
{text(48,h-28,'mmo-portal  ·  NestJS / Next.js / SQL Server / Redis',12,MUTED)}</g></svg>'''
    (OUT / name).write_text(svg+'\n')

body = text(60,208,'Your world.',62,TEXT,700)+text(60,282,'Your legend.',62,GREEN,700)
body += text(64,334,'Accounts · Marketplace · Auctions · Payments · Rankings',21,MUTED)
for x,label in [(64,'TypeScript'),(214,'NestJS'),(344,'Next.js'),(474,'SQL Server'),(644,'Redis')]:
    body += f'<rect x="{x}" y="365" width="130" height="38" rx="19" fill="{PANEL}" stroke="{LINE}"/>'+text(x+16,390,label,15)
body += '<circle cx="1120" cy="258" r="142" fill="none" stroke="#3a3226" stroke-width="1"/><circle cx="1120" cy="258" r="105" fill="none" stroke="#665538" stroke-width="1"/>'
body += f'<path d="m1120 146 80 112-80 112-80-112Z" fill="{PANEL}" stroke="{GREEN}" stroke-width="3"/><path d="m1120 215 30 43-30 43-30-43Z" fill="{GREEN}"/>'
save('banner.svg',1440,465,'mmo-portal','A modular platform for MMORPG communities.',body)

body = box(48,190,320,135,'Browser',['Localized React UI','Cookie-based sessions'])
body += box(440,190,350,135,'Nginx gateway',['/ → web   /api → API','Trusted client-IP boundary'])
body += box(878,190,390,135,'Next.js web',['App Router / React Query','EN + RU / reusable UI'])
body += arrow(368,255,440,255)+arrow(790,255,878,255)
body += box(440,395,350,180,'NestJS API',['Auth / shop / auctions / stats','DTO validation / rate limiting','Signed payment callbacks'])
body += arrow(615,325,615,395,'/api',12,0)
body += box(48,635,320,135,'SQL Server · Portal',['Accounts / credits / orders','Atomic commerce transactions'])
body += box(440,635,350,135,'SQL Server · GameWorld',['Game adapter contract','Same instance as Portal'])
body += box(878,395,390,180,'Redis',['Shared throttling and cache','Bull notification queue','Retries with exponential backoff'])
body += box(878,635,390,135,'External integrations',['SMTP email delivery','FreeKassa / AnyPay / ENOT'])
body += arrow(520,575,210,635)+arrow(615,575,615,635)+arrow(790,475,878,475)+arrow(1073,575,1073,635)
save('architecture.svg',1320,840,'System architecture','A single public gateway with explicit application and data boundaries.',body)

body = box(48,195,260,155,'Create account',['Validate email + password','Hash portal credentials','Queue a verification email'])
body += box(370,195,260,155,'Verify email',['Purpose-bound JWT','Enable account access','Issue session cookies'])
body += box(692,195,260,155,'Use the portal',['Access + refresh tokens','Server-side authorization','Strict DTO validation'])
body += box(1014,195,260,155,'Recover access',['Short-lived reset link','Bind to current password','Update both hashes once'])
body += arrow(308,270,370,270)+arrow(630,270,692,270)+arrow(952,270,1014,270)
body += box(48,420,1226,125,'Email delivery',['API → Redis queue → Bull worker → Handlebars template → SMTP','Queue logs omit reset links, message bodies, and authentication tokens.'])
save('auth-flow.svg',1320,610,'Account and recovery flow','Verification and password reset use distinct signed token purposes.',body)

body = box(48,195,350,160,'Payment settlement',['Verify provider signature','Match provider / amount / currency','Conditionally claim NEW order'])
body += box(480,195,350,160,'Marketplace purchase',['Validate catalog + quantity','Debit credits with funds predicate','Insert game item delivery'])
body += box(912,195,350,160,'Auction purchase',['Conditionally claim active lot','Debit buyer / credit seller','Transfer reserved game gold'])
body += box(245,450,820,155,'One SQL Server transaction',['Portal ledger + order state + game inventory updates commit together.','Conditional updates prevent duplicate settlement and double purchases.','An exception rolls back every participating write.'])
body += arrow(220,355,420,450)+arrow(655,355,655,450)+arrow(1080,355,900,450)
save('commerce-flow.svg',1320,680,'Transactional commerce','Decimal arithmetic, conditional state changes, and a shared SQL transaction.',body)

body = box(48,195,320,160,'Local source',['apps/api + apps/web','Independent frozen lockfiles','Environment examples only'])
body += box(450,195,350,160,'Build and verify',['Lint / types / unit tests','Production builds / dependency audit','Release content and secret check'])
body += box(880,195,380,160,'Container runtime',['Non-root API + standalone web','Redis with persistent storage','Nginx is the public entrypoint'])
body += arrow(368,275,450,275)+arrow(800,275,880,275)
body += box(48,435,560,150,'Runtime configuration',['Secrets enter via env_file at container start.','Migrations and seed run explicitly before API startup.'])
body += box(690,435,570,150,'Web configuration',['NEXT_PUBLIC_* values are compiled into browser assets.','Rebuild the web image after changing public settings.'])
save('deployment.svg',1320,660,'Build and deployment','Portable Docker Compose configuration under deploy/.',body)

body = box(48,195,330,145,'User',['Unique login / email','Password hashes / referral code','Current and lifetime credits'])
body += box(490,195,330,145,'OrderTransaction',['Provider / amount / currency','NEW → SUCCESS','Provider transaction reference'])
body += box(930,195,330,145,'PayProvider',['Enabled flag / exchange rate','Minimum amount','Bonus tiers'])
body += box(48,460,330,145,'OrderAuction',['Seller / optional buyer','Gold / credit price','active → completed or canceled'])
body += box(490,460,330,145,'HistoryBuy / HistoryTopUp',['Purchase and credit audit trail','Previous and resulting balances','Game delivery reference'])
body += box(930,460,330,145,'Catalog / GameServer',['Categories / items / services','Per-server availability','Game item mapping'])
body += arrow(378,265,490,265,'1 : N',0,-14)+arrow(930,265,820,265,'1 : N',0,-14)
body += arrow(210,340,210,460,'1 : N',12,0)+arrow(655,340,655,460,'settles',12,0)+arrow(930,530,820,530,'item reference',-50,-14)
save('data-model.svg',1320,685,'Domain model','Portal records remain separate from game tables while writes share a transaction.',body)

body = box(48,190,380,185,'Identity',['Account / credentials / verification','AccountsPort: account summaries','Owns access state and sessions'])
body += box(470,190,380,185,'Wallet',['Money / WalletBalance','WalletPort: credit and debit','Owns balances and credit audit'])
body += box(892,190,380,185,'Game integration',['GamePort: delivery and gold','SQL anti-corruption adapter','Same-instance transaction writes'])
body += box(48,450,380,185,'Catalog',['Product quote / purchase history','Uses Accounts + Wallet + Game','Active catalog read projections'])
body += box(470,450,380,185,'Auctions',['AuctionLot lifecycle / reservation','Uses Accounts + Wallet + Game','Conditional buy / cancel claims'])
body += box(892,450,380,185,'Payments',['PaymentOrder / BonusPolicy','Uses Wallet for settlement','Authenticated provider receipts'])
body += arrow(238,450,238,375,'account lookup',14,0)
body += arrow(660,450,660,375,'wallet transfers',14,0)
body += arrow(1082,450,815,375,'WalletPort',0,-14)
body += box(48,710,1224,130,'Rankings · supporting read context',['RankingsReadPort → scheduled game projections → Redis cache → public HTTP queries','Contexts collaborate through application ports. Composition roots select concrete adapters.'])
save('context-map.svg',1320,910,'Bounded context map','A modular monolith with explicit ownership and public collaboration ports.',body)

body = box(48,205,360,190,'Presentation',['Nest controllers / guards','Validated HTTP DTOs','Request identity / receipt mapping'])
body += box(480,205,360,190,'Application',['Use cases / plain contracts','Repository and gateway ports','Opaque transaction propagation'])
body += box(912,205,360,190,'Domain',['Account / Product / AuctionLot','PaymentOrder / bonus policy','Money / WalletBalance'])
body += arrow(408,300,480,300)+arrow(840,300,912,300)
body += box(480,485,360,190,'Infrastructure',['Prisma repositories / UnitOfWork','Game SQL / payment adapters','JWT / bcrypt / Redis / mail'])
body += arrow(660,485,660,395,'implements ports',20,0)
body += box(48,755,1224,125,'Composition roots',['Nest modules bind concrete adapters to application constructors through explicit factories.','Architecture tests enforce inward imports; composition tests verify the real module graph.'])
save('ddd-layers.svg',1320,950,'Domain-driven dependency flow','Business models are independent of NestJS, Prisma, HTTP validation, and external services.',body)
