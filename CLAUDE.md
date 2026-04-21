# CLAUDE.md — Kiima

> This file is the single source of truth for all development decisions on Kiima.
> Read this entire file before writing any code. Every session, every feature, every component.

---

## ⚡ STANDING RULES — APPLY EVERY SESSION WITHOUT EXCEPTION

These rules are always active. They do not need to be re-stated by the user.

```
1. After creating or modifying ANY component:
   → Immediately update Section 7 (Component Inventory) in this file.
   → Do this before moving on to the next task.
   → Do not wait to be asked.

2. At the end of EVERY session:
   → Append a new entry to BUILD_LOG.md with:
      - Date
      - What was built this session
      - What to build next
      - Any open issues or broken things
   → This is the last action of every session. Always.

3. If a component is renamed or moved by the user outside of a session:
   → The user must inform Claude at the start of the next session.
   → Claude will update Section 7 immediately upon being told.

4. "Done" means:
   → Code is written ✓
   → Section 7 is updated ✓
   → BUILD_LOG.md is updated ✓
   All three. Not one. Not two. All three.
```

---

## 1. WHAT IS KIIMA

Kiima is a **social gifting and support pool platform**. It lets creators receive monetary gifts through a personalized link, create collaborative funding pools, and offer preset or custom gifting options (Gift Tags).

### The one-line creative direction
> "A soft, modern digital space where giving feels natural."

### What Kiima is NOT
- Not a donation platform
- Not a fintech dashboard
- Not a banking app
- Not a generic payment link tool

### Core emotional tone
Light. Friendly. Effortless. Human. Every word, every interaction, every UI state must feel like this.

---

## 2. TECH STACK

### Locked decisions — do not suggest alternatives

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | SSR for profile pages, server actions for mutations |
| Language | TypeScript (strict) | Type safety across all layers |
| Styling | Tailwind CSS + CSS variables | Utility classes + design token system |
| Database + Auth | Supabase | Postgres, RLS, storage, auth in one |
| Payments | **Paystack only** | Nigeria-compatible, NGN native support |
| UI Base | shadcn/ui | Headless, unstyled, fully customisable |
| Fonts | Fraunces (display) + Plus Jakarta Sans (body) | Warm, editorial, non-corporate |
| Deployment | Vercel | Next.js native |
| Email | Resend | Transactional emails only |

### Never suggest
- Stripe (not Nigeria-compatible for V1)
- Prisma (Supabase client is used directly)
- Pages Router
- MongoDB
- Any real-time solution (V1 explicitly excludes this)
- Any wallet or payout system (V2+)

---

## 3. DESIGN SYSTEM CONTRACT

This is law. Every component must follow these rules exactly.

### 3.1 Design Tokens

All tokens live in `styles/tokens.css` and are referenced as CSS variables throughout the app. Never hardcode values.

```css
/* Colours */
--color-bg:           #F6F3EE;   /* Page background — warm off-white */
--color-surface:      #FFFFFF;   /* Card surface */
--color-border:       rgba(28, 25, 22, 0.06);
--color-border-hover: rgba(28, 25, 22, 0.12);

--color-text-primary:  #1C1916;  /* Main text */
--color-text-secondary:#5A4D44;  /* Body copy */
--color-text-muted:    #9A9089;  /* Hints, placeholders */
--color-text-faint:    #B5AAAA;  /* Labels, metadata */

--color-accent:        #C87B5C;  /* Terracotta — primary accent */
--color-accent-soft:   #FDF1EC;  /* Accent background tint */
--color-accent-light:  #E8A07A;  /* Progress bar gradient end */

--color-success:       #3D9B56;
--color-success-soft:  #EEF8F0;
--color-danger:        #E07070;
--color-danger-soft:   #FDF0F0;

/* Typography */
--font-display: 'Fraunces', serif;
--font-body:    'Plus Jakarta Sans', sans-serif;

/* Spacing scale */
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  28px;
--space-2xl: 40px;

/* Radii */
--radius-sm:  10px;
--radius-md:  14px;
--radius-lg:  22px;
--radius-full: 100px;

/* Shadows */
--shadow-card:       0 2px 12px rgba(28, 25, 22, 0.04);
--shadow-card-hover: 0 6px 28px rgba(28, 25, 22, 0.09);
--shadow-btn:        0 8px 24px rgba(28, 25, 22, 0.20);
```

### 3.2 Typography Rules

```
Display headings  → font-family: var(--font-display), weight 400–500
Section headings  → font-family: var(--font-body), weight 600
Body copy         → font-family: var(--font-body), weight 400, size 14px, line-height 1.65
Labels/metadata   → font-family: var(--font-body), weight 700, size 11px, uppercase, letter-spacing 0.08em
Amounts/numbers   → font-family: var(--font-body), weight 700
```

Never use system fonts. Never use Arial, Inter, or Roboto.

### 3.3 Card System

Every UI surface is a card. Cards are the atomic layout unit of Kiima.

```
Base card styles:
  background:    var(--color-surface)
  border-radius: var(--radius-lg)        /* 22px */
  border:        1px solid var(--color-border)
  box-shadow:    var(--shadow-card)
  padding:       var(--space-xl)         /* 28px default, 24px compact */

Hover state:
  box-shadow:    var(--shadow-card-hover)
  transform:     translateY(-1px)
  transition:    all 0.22s ease
```

Cards must never:
- Have heavy gradients as backgrounds
- Use coloured borders (except for focus/error states)
- Contain more than one primary purpose

### 3.4 Interaction Standards

```
Hover:   translateY(-1px) + shadow increase
Click:   scale(0.98)
Focus:   border-color → var(--color-accent), background → white
All transitions: 0.15s–0.22s ease — never instant, never slow
```

### 3.5 Language & Copy Rules

| Don't say | Say instead |
|---|---|
| "Make payment" | "Send gift ❤️" |
| "Transaction successful" | "Your gift was sent! Thank you 🙏" |
| "Submit" | "Send love" / "Support this 🤍" |
| "User" | "Creator" or name |
| "Amount" (as a title) | Use contextually — "How much?" |
| "Error occurred" | "Something went wrong — try again" |

Copy must always be short, warm, and slightly casual. Never corporate. Never financial.

### 3.6 Grid Layout

```
Desktop:  Multi-column card grid — 2 or 3 columns depending on page
Mobile:   Single column, cards stack vertically
Spacing:  16px gap between cards
Padding:  20px horizontal page padding
Max-width: 1080px, centered
```

---

## 4. DOMAIN RULES & BUSINESS LOGIC

These rules are non-negotiable. They come from the product spec. Never work around them, never "improve" them without explicit instruction.

### 4.1 Currency

- Every creator sets ONE currency on signup: NGN (₦), USD ($), GBP (£), EUR (€)
- All transactions for that creator use their selected currency
- **No currency conversion in V1 — ever**
- Display format: `₦2,000` / `$20` / `£15` — always with symbol, always with locale-formatted number
- Default currency for all UI examples and tests: **NGN (₦)**

### 4.2 Gift Tags

- The system-default tag `"Buy me a coffee ☕"` always exists for every creator
- Default tag amount: ₦2,000 (or currency equivalent — creator cannot change this)
- The default tag **cannot be edited or deleted** — ever
- Creators can add unlimited custom tags, each with:
  - A label (emoji allowed, encouraged)
  - A fixed amount
- Tags appear as pill buttons on the gift link page
- **Clicking a tag auto-fills the amount field AND locks it (non-editable)**
- To enter a custom amount, the user must not select any tag (or clear selection)
- Tags are optional — creators may have only the default tag

### 4.3 Anonymous Identity Logic

This is the most important UX rule in the product. Get this right every time.

```
Rule 1: The contribution-level anonymous choice ALWAYS overrides any other state.

Rule 2: Anonymous toggle is per-contribution, decided at the moment of payment.

Rule 3: Display logic:
  - If anonymous = true  → display as "Anonymous"
  - If anonymous = false AND name provided → display as that name
  - If anonymous = false AND no name → display as "Anonymous" (fallback)

Rule 4: The UI must always show the user how they'll appear:
  - Toggle ON  → "👤 You'll appear as Anonymous"
  - Toggle OFF → "👤 You'll appear as [name]" or "👤 You'll appear as your name"
```

### 4.4 Support Pools

- Any creator can create a support pool with: title, optional description, target amount
- Pool URL: `kiima.co/{username}/pool/{pool-slug}`
- Pool states: `open` | `closed`
- Only the creator can close a pool
- When a pool is closed:
  - Show banner: "This support pool is closed"
  - Disable all contribution inputs and the CTA button
  - Keep all contribution history visible
  - Keep progress bar and totals visible
- Progress is calculated: `(total_raised / goal_amount) * 100`
- Pool totals update on page refresh — **no real-time in V1**

### 4.5 Contribution Display Format

Always render exactly as:
```
"{DisplayName} sent {CurrencySymbol}{Amount}"       → Victor sent ₦5,000
"Anonymous sent {CurrencySymbol}{Amount}"           → Anonymous sent ₦2,000
"Anonymous bought a coffee ☕"                       → when default tag + anonymous
```

Latest contributions always appear first (descending by created_at).

### 4.6 Payment Flow & Fee Model

> ✅ **FEE MODEL — REFACTORED:**
>
> Two separate fees apply, paid by different parties:
>
> **1. Paystack processing fee → paid by the GIFTER**
>   - Formula (NGN): `min((gift_amount × 1.5%) + ₦100, ₦2,000)`
>   - Added ON TOP of the gift amount before Paystack charges the gifter
>   - Gifter sees a live fee breakdown in the form before paying
>
> **2. Kiima platform fee (3%) → paid by the CREATOR**
>   - Deducted from the gift amount via Paystack split payment
>   - Goes directly to Kiima's Paystack account at settlement
>   - Creator never touches this money — split happens at source
>
> Example on a ₦10,000 gift:
> ```
> Gifter pays:           ₦10,250  (₦10,000 gift + ₦250 Paystack fee)
> Paystack takes:        ₦250     (their 1.5% + ₦100)
> Net after Paystack:    ₦10,000
> Kiima split (3%):      ₦300     → Kiima's Paystack account
> Creator receives:      ₦9,700   → Creator's bank via subaccount
> ```
>
> Rules:
> - All fee calculations happen server-side — never trust client values
> - GiftForm and ContributeForm MUST show a live fee breakdown as gifter types:
>   "You're sending ₦10,000 · Processing fee ₦250 · Total charged ₦10,250"
> - Contribution record stores: gift_amount, paystack_fee, kiima_fee,
>   creator_amount, total_charged
> - Pool raised total increments by gift_amount (₦10,000) — not total_charged
> - platform_fee_percent (default 3) is stored in platform_settings — never hardcoded
> - Use calculateAllFees() from lib/utils/fee.ts — never inline fee math

```
1. Gifter enters gift amount (e.g. ₦10,000)

2. GiftForm/ContributeForm shows live fee breakdown:
   paystack_fee  = min((gift_amount × 0.015) + 100, 2000)
   total_charged = gift_amount + paystack_fee
   Display: "Processing fee: ₦250 · You'll be charged: ₦10,250"

3. Gifter clicks CTA → validate (gift_amount > 0)

4. Server action (initializeGift) — recalculates everything server-side:
   a. Read platform_fee_percent from platform_settings
   b. fees = calculateAllFees(gift_amount, platform_fee_percent)
      → { gift_amount, paystack_fee, kiima_fee, creator_amount, total_charged }
   c. Validate creator has paystack_subaccount_code (required)
   d. Create PENDING contribution record with all 5 fee fields
   e. Initialize Paystack transaction:
      - amount:               toKobo(total_charged)      ← gifter pays this
      - subaccount:           creator's subaccount_code
      - bearer:               'account'                  ← Kiima bears fee at API level
                                                            (net zero — gifter already paid it)
      - transaction_charge:   toKobo(kiima_fee)          ← Kiima's 3% split in kobo

5. Redirect gifter to Paystack checkout

6. Paystack redirects back to success URL on completion

7. Paystack fires webhook to /api/webhooks/paystack

8. Webhook handler:
   a. Verify Paystack signature (HMAC SHA512)
   b. Only handle charge.success events
   c. Look up contribution by paystack_ref
   d. Update status: 'pending' → 'confirmed'
   e. If pool_id → increment support_pools.raised by gift_amount (not total_charged)
   f. Log event to webhook_logs

9. Success page shown to gifter
```

**Critical:** Never record a contribution before webhook confirmation. The redirect success page is UI only — DB write happens in webhook only. If webhook fails, contribution stays 'pending' — visible in admin webhook log.

### 4.7 Creator Dashboard Data

The dashboard is **read-only aggregated data**. It shows:
- Total gifts received (sum of all direct gifts)
- Total pool contributions (sum of all pool contributions)
- Total gift count (count of all contributions)
- Transaction list (all contributions, newest first)
- Gift tag management (CRUD, except default tag)
- Support pool list with status and progress

### 4.8 Social Links

Creators can add links to their social media profiles. These appear as icon buttons at the bottom of the ProfileCard on the public gift page.

```
Supported platforms (V1):
  instagram  → instagram.com
  tiktok     → tiktok.com
  twitter    → twitter.com or x.com
  youtube    → youtube.com
  linkedin   → linkedin.com
  website    → any valid https:// URL

Rules:
  - Max 6 links per creator (one per platform — enforced by DB unique constraint)
  - URLs must begin with https://
  - Platform-specific validation applied before saving:
      instagram  → must contain instagram.com
      tiktok     → must contain tiktok.com
      twitter    → must contain twitter.com OR x.com
      youtube    → must contain youtube.com
      linkedin   → must contain linkedin.com
      website    → any valid https:// URL
  - Empty URL submitted = delete that platform's link, not save an empty row
  - Zero links is valid — SocialLinksRow simply does not render on public page
  - Links are public — anyone visiting the gift page can see them

Display rules:
  - Public ProfileCard: icons ONLY, no text labels, each opens in new tab
    (target="_blank" rel="noopener noreferrer")
  - Dashboard links page: full URL shown with save/delete controls per platform
  - Hover on icon: soft colour tint matching the platform's brand colour

ProfileCard visibility rule:
  - The kiima.co/{username} copy-link bar is ONLY shown inside the creator 
    dashboard — NEVER on the public gift page
  - ProfileCard accepts a showLinkBar boolean prop (default: false)
  - Dashboard passes showLinkBar={true}
  - Public gift page omits showLinkBar (defaults to false)
```

---

## 5. DATABASE SCHEMA

### Supabase Tables

```sql
-- Creator profiles (extends Supabase auth.users)
profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id),
  username    text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio         text,
  avatar_url  text,
  currency    text NOT NULL DEFAULT 'NGN',  -- 'NGN' | 'USD' | 'GBP' | 'EUR'
  is_admin    boolean DEFAULT false,        -- set manually in Supabase, never via UI
  created_at  timestamptz DEFAULT now()
)

-- Gift tags (both system and custom)
gift_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  label       text NOT NULL,
  amount      numeric NOT NULL,
  is_default  boolean DEFAULT false,   -- true = system "Buy me a coffee" tag
  created_at  timestamptz DEFAULT now()
)

-- Support pools
support_pools (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  goal_amount numeric NOT NULL,
  raised      numeric DEFAULT 0,       -- kept in sync via webhook
  status      text DEFAULT 'open',     -- 'open' | 'closed'
  slug        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, slug)
)

-- All contributions (direct gifts + pool contributions)
contributions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid REFERENCES profiles(id),         -- creator receiving the gift
  pool_id         uuid REFERENCES support_pools(id),    -- null if direct gift
  tag_id          uuid REFERENCES gift_tags(id),        -- null if custom amount
  gift_amount     numeric NOT NULL,                     -- amount gifter intends to send creator
  paystack_fee    numeric NOT NULL DEFAULT 0,           -- 1.5% + ₦100 — paid by gifter on top
  kiima_fee       numeric NOT NULL DEFAULT 0,           -- 3% platform fee — deducted from creator
  creator_amount  numeric NOT NULL,                     -- gift_amount - kiima_fee (creator receives)
  total_charged   numeric NOT NULL,                     -- gift_amount + paystack_fee (gifter pays)
  currency        text NOT NULL,
  display_name    text,                                 -- null if anonymous
  is_anonymous    boolean DEFAULT false,
  paystack_ref    text UNIQUE NOT NULL,                 -- Paystack payment reference
  status          text DEFAULT 'pending',               -- 'pending' | 'confirmed'
  created_at      timestamptz DEFAULT now()
)

-- Paystack webhook event log (admin visibility)
webhook_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    text NOT NULL,                        -- e.g. 'charge.success'
  paystack_ref  text,                                 -- payment reference if applicable
  payload       jsonb NOT NULL,                       -- full raw webhook body
  status        text NOT NULL,                        -- 'processed' | 'failed' | 'ignored'
  error_message text,                                 -- populated if status = 'failed'
  created_at    timestamptz DEFAULT now()
)

-- Global platform settings (one row only — admin editable)
platform_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_fee_percent    numeric NOT NULL DEFAULT 3,   -- Kiima's cut deducted from creator (default 3%)
  default_tag_amount_ngn  numeric NOT NULL DEFAULT 2000,
  default_tag_amount_usd  numeric NOT NULL DEFAULT 2,
  default_tag_amount_gbp  numeric NOT NULL DEFAULT 2,
  default_tag_amount_eur  numeric NOT NULL DEFAULT 2,
  maintenance_mode        boolean DEFAULT false,
  updated_at              timestamptz DEFAULT now()
)

-- Creator social links
social_links (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform       text NOT NULL,
                 -- 'instagram' | 'tiktok' | 'twitter' | 
                 -- 'youtube' | 'linkedin' | 'website'
  url            text NOT NULL,
  display_order  int DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)   -- one per platform per creator, enforced at DB level
)
```

### RLS Policies

```
profiles:          Public read. Only owner can update. is_admin cannot be updated via client — ever.
gift_tags:         Public read (for gift link page). Only owner can insert/update/delete.
support_pools:     Public read. Only owner can insert/update.
contributions: 
  - Public read (for contribution feeds)
  - No direct insert from client (webhook only)
  - Creator can read their own received contributions
webhook_logs:
  - No public access
  - Admin only (service role in webhook handler writes, admin client reads)
platform_settings:
  - No public access
  - Admin only read/write via service role
social_links:
  - Public read (for public gift page display)
  - Only owner can insert/update/delete
```

---

## 6. FILE & FOLDER ARCHITECTURE

```
kiima/
├── CLAUDE.md                          ← You are here
│
├── app/
│   ├── layout.tsx                     ← Root layout, fonts loaded here
│   ├── page.tsx                       ← Marketing / landing page
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                 ← Dashboard shell (sidebar/nav)
│   │   ├── page.tsx                   ← Overview stats
│   │   ├── transactions/page.tsx
│   │   ├── tags/page.tsx              ← Gift tag management
│   │   ├── links/page.tsx             ← Social link management
│   │   └── pools/
│   │       ├── page.tsx               ← Pool list
│   │       └── [id]/page.tsx          ← Pool detail
│   │
│   ├── admin/
│   │   ├── layout.tsx                 ← Admin shell — checks is_admin, blocks all others
│   │   ├── page.tsx                   ← Platform overview (stats, volume, signups)
│   │   ├── creators/
│   │   │   ├── page.tsx               ← All creators list, search, filters
│   │   │   └── [id]/page.tsx          ← Individual creator detail + actions
│   │   ├── transactions/page.tsx      ← All platform transactions, Paystack ref lookup
│   │   ├── pools/page.tsx             ← All pools across platform, force-close
│   │   ├── tags/page.tsx              ← Custom tag moderation across all creators
│   │   ├── webhooks/page.tsx          ← Webhook event log
│   │   └── settings/page.tsx          ← Platform settings (default tag amount, maintenance mode)
│   │
│   ├── [username]/
│   │   ├── page.tsx                   ← Public gift link page
│   │   └── pool/
│   │       └── [slug]/page.tsx        ← Public pool page
│   │
│   └── api/
│       └── webhooks/
│           └── paystack/route.ts      ← Paystack webhook handler
│
├── components/
│   ├── ui/                            ← shadcn/ui base components (do not edit)
│   │
│   ├── cards/                         ← All card-based UI components
│   │   ├── ProfileCard.tsx
│   │   ├── GiftActionCard.tsx
│   │   ├── SupportPoolCard.tsx
│   │   ├── ContributionFeedCard.tsx
│   │   └── DashboardStatCard.tsx
│   │
│   ├── forms/                         ← Form components
│   │   ├── GiftForm.tsx               ← Direct gifting form
│   │   ├── ContributeForm.tsx         ← Pool contribution form
│   │   ├── PoolCreateForm.tsx
│   │   └── SocialLinksForm.tsx        ← Dashboard social link manager
│   │
│   ├── shared/                        ← Reusable atoms
│   │   ├── GiftTagPill.tsx
│   │   ├── AnonymousToggle.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ContributionRow.tsx
│   │   ├── CurrencyInput.tsx
│   │   ├── KiimaButton.tsx
│   │   └── SocialLinksRow.tsx         ← Icon row on public profile card
│   │
│   └── layout/
│       ├── Navbar.tsx
│       └── PageShell.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  ← Browser client
│   │   ├── server.ts                  ← Server client (server components/actions)
│   │   └── admin.ts                   ← Admin client (webhooks only)
│   │
│   ├── paystack/
│   │   ├── initialize.ts              ← Create Paystack transaction
│   │   ├── verify.ts                  ← Verify payment reference
│   │   └── webhook.ts                 ← Signature verification + event handling
│   │
│   ├── actions/                       ← Next.js server actions
│   │   ├── gift.actions.ts
│   │   ├── pool.actions.ts
│   │   ├── tag.actions.ts
│   │   └── link.actions.ts            ← Social link CRUD
│   │
│   └── utils/
│       ├── currency.ts                ← formatCurrency(amount, currency)
│       ├── display-name.ts            ← resolveDisplayName(name, isAnon)
│       └── slug.ts                    ← generateSlug(title)
│
├── styles/
│   ├── globals.css
│   └── tokens.css                     ← ALL design tokens live here
│
└── types/
    └── index.ts                       ← All shared TypeScript types
```

---

## 7. COMPONENT INVENTORY

Keep this updated as components are built. Before building any new component, check this list.

### Cards

| Component | File | Key Props |
|---|---|---|
| `ProfileCard` | `cards/ProfileCard.tsx` | `profile: Profile, showLinkBar?: boolean` — `showLinkBar` defaults `false`; pass `true` in dashboard only |
| `GiftActionCard` | `cards/GiftActionCard.tsx` | `tags: GiftTag[], currency: Currency, selectedTag?, onTagSelect?, onAmountChange?` |
| `SupportPoolCard` | `cards/SupportPoolCard.tsx` | `pool: SupportPool, currency: Currency, creatorName?: string, contributorCount?: number` |
| `ContributionFeedCard` | `cards/ContributionFeedCard.tsx` | `contributions: Contribution[], heading?: string` |
| `DashboardStatCard` | `cards/DashboardStatCard.tsx` | `label: string, value: string, sub: string` |
| `AdminStatCard` | `cards/AdminStatCard.tsx` | `label: string, value: string, sub?: string` |

### Forms

| Component | File | Key Props |
|---|---|---|
| `GiftForm` | `forms/GiftForm.tsx` | `recipientId: string, tags: GiftTag[], currency: Currency, feePercent: number` |
| `ContributeForm` | `forms/ContributeForm.tsx` | `poolId: string, recipientId: string, currency: Currency, isClosed: boolean, feePercent: number` |
| `PoolCreateForm` | `forms/PoolCreateForm.tsx` | `userId: string, currency: Currency` |
| `SocialLinksForm` | `forms/SocialLinksForm.tsx` | `userId: string, existingLinks: SocialLink[]` |

### Shared Atoms

| Component | File | Key Props |
|---|---|---|
| `GiftTagPill` | `shared/GiftTagPill.tsx` | `tag, selected, onSelect, currency` |
| `AnonymousToggle` | `shared/AnonymousToggle.tsx` | `isAnon, displayName?, onChange` |
| `ProgressBar` | `shared/ProgressBar.tsx` | `raised: number, goal: number, currency: Currency` |
| `ContributionRow` | `shared/ContributionRow.tsx` | `contribution: Contribution, isLast?: boolean, source?: string` |
| `CurrencyInput` | `shared/CurrencyInput.tsx` | `currency: Currency, value, onChange?, readOnly?` |
| `KiimaButton` | `shared/KiimaButton.tsx` | `children, onClick?, loading?, disabled?, type?, variant?, fullWidth?` |
| `SocialLinksRow` | `shared/SocialLinksRow.tsx` | `links: SocialLink[]` |

### Auth Pages

| Route | File |
|---|---|
| `/signup` | `app/(auth)/signup/page.tsx` |
| `/login` | `app/(auth)/login/page.tsx` |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` |

### API Routes

| Route | File |
|---|---|
| `/api/auth/callback` | `app/api/auth/callback/route.ts` |
| `/api/webhooks/paystack` | `app/api/webhooks/paystack/route.ts` |

### Server Actions

| Action file | Exports |
|---|---|
| `lib/actions/auth.actions.ts` | `signupAction`, `loginAction`, `forgotPasswordAction`, `resetPasswordAction` |
| `lib/actions/tag.actions.ts` | `getTagsByUser`, `createTag`, `deleteTag` |
| `lib/actions/gift.actions.ts` | `initializeGift` |
| `lib/actions/pool.actions.ts` | `createPool`, `getPools`, `closePool`, `contributePool`, `updateShowContributors` |
| `lib/actions/admin.actions.ts` | `suspendCreator`, `unsuspendCreator`, `forceClosePool`, `deleteCustomTag`, `updatePlatformSettings`, `recheckPaystackPayment` |
| `lib/actions/link.actions.ts` | `getSocialLinks`, `upsertSocialLink`, `deleteSocialLink` |

### Paystack Library

| File | Exports |
|---|---|
| `lib/paystack/initialize.ts` | `initializePaystackTransaction` |
| `lib/paystack/webhook.ts` | `verifyPaystackSignature` |
| `lib/paystack/verify.ts` | `verifyPaystackTransaction` |

### Dashboard Loading Skeletons

| File |
|---|
| `app/dashboard/loading.tsx` |
| `app/dashboard/transactions/loading.tsx` |
| `app/dashboard/pools/loading.tsx` |
| `app/dashboard/tags/loading.tsx` |

### Dashboard Shell

| File | Notes |
|---|---|
| `app/dashboard/layout.tsx` | Server Component shell — session guard, sidebar + mobile tab nav |
| `app/dashboard/DashboardNav.tsx` | `variant: 'sidebar' \| 'tabs'` |
| `app/dashboard/LogoutButton.tsx` | Signs out, redirects to `/login` |

**Padding system:** `.k-dash-main` (dashboard) and `.k-page` (public pages) in `globals.css` — 100px desktop → 40px tablet → 20px mobile. Pages set vertical padding only.

### Dashboard Pages

| Route | File |
|---|---|
| `/dashboard` | `app/dashboard/page.tsx` |
| `/dashboard/transactions` | `app/dashboard/transactions/page.tsx` |
| `/dashboard/tags` | `app/dashboard/tags/page.tsx` + `TagsClient.tsx` |
| `/dashboard/pools` | `app/dashboard/pools/page.tsx` + `PoolsClient.tsx` + `CopyPoolLink.tsx` |
| `/dashboard/pools/[id]` | `app/dashboard/pools/[id]/page.tsx` + `ClosePoolButton.tsx` + `ShowContributorsToggle.tsx` |
| `/dashboard/links` | `app/dashboard/links/page.tsx` |

### Public Pages

| Route | File |
|---|---|
| `/` | `app/page.tsx` |
| `/[username]` | `app/[username]/page.tsx` |
| `/[username]/pool/[slug]` | `app/[username]/pool/[slug]/page.tsx` |
| `/gift/success` | `app/gift/success/page.tsx` |
| `/gift/cancelled` | `app/gift/cancelled/page.tsx` |
| `(root)` not-found | `app/not-found.tsx` |
| `(root)` error | `app/error.tsx` |
| `/[username]` not-found | `app/[username]/not-found.tsx` |
| `/[username]/pool/[slug]` not-found | `app/[username]/pool/[slug]/not-found.tsx` |

### Admin Shell

| File | Notes |
|---|---|
| `app/admin/layout.tsx` | Server Component guard — `is_admin` check, sidebar shell. Desktop-only. |
| `app/admin/AdminNav.tsx` | Sidebar nav for all 7 admin sections |
| `app/admin/AdminLogoutButton.tsx` | Signs out, redirects to `/login` |

### Admin Pages

| Route | File | Key client components |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | `AdminStatCard` |
| `/admin/creators` | `app/admin/creators/page.tsx` | `CreatorsClient.tsx` |
| `/admin/creators/[id]` | `app/admin/creators/[id]/page.tsx` | `SuspendButton.tsx` |
| `/admin/transactions` | `app/admin/transactions/page.tsx` | `RecheckButton.tsx` |
| `/admin/pools` | `app/admin/pools/page.tsx` | `ForceCloseButton.tsx` |
| `/admin/tags` | `app/admin/tags/page.tsx` | `DeleteTagButton.tsx` |
| `/admin/webhooks` | `app/admin/webhooks/page.tsx` | — |
| `/admin/settings` | `app/admin/settings/page.tsx` | `SettingsForm.tsx` |

### Database Migrations

| File | Change |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | All tables, RLS, platform_settings seed |
| `supabase/migrations/002_default_tag_trigger.sql` | Default tag trigger on profile insert |
| `supabase/migrations/003_pool_show_contributors.sql` | ADD show_contributors to support_pools |
| `supabase/migrations/004_admin_fields.sql` | ADD suspended to profiles (idempotent) |
| `supabase/migrations/005_social_links.sql` | CREATE social_links table with RLS |
| `supabase/migrations/006_contributions_fee_columns.sql` | ADD fee + net_amount to contributions (idempotent) |
| `supabase/migrations/007_payment_refactor.sql` | Rename fee columns; ADD paystack_fee, total_charged, platform_fee_percent |

---

## 8. TYPESCRIPT TYPES

```typescript
// types/index.ts

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type PoolStatus = 'open' | 'closed';
export type ContributionStatus = 'pending' | 'confirmed';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  currency: Currency;
  created_at: string;
}

export interface GiftTag {
  id: string;
  user_id: string;
  label: string;
  amount: number;
  is_default: boolean;
  created_at: string;
}

export interface SupportPool {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  raised: number;
  status: PoolStatus;
  slug: string;
  created_at: string;
}

export interface Contribution {
  id: string;
  recipient_id: string;
  pool_id: string | null;
  tag_id: string | null;
  gift_amount: number;      // amount gifter intends to send to creator
  paystack_fee: number;     // 1.5% + ₦100 — added on top, paid by gifter
  kiima_fee: number;        // 3% platform fee — deducted from creator via split
  creator_amount: number;   // gift_amount - kiima_fee (what creator receives)
  total_charged: number;    // gift_amount + paystack_fee (what gifter actually pays)
  currency: Currency;
  display_name: string | null;   // null = anonymous
  is_anonymous: boolean;
  paystack_ref: string;
  status: ContributionStatus;
  created_at: string;
  // Joined fields
  tag?: GiftTag;
}

export type WebhookStatus = 'processed' | 'failed' | 'ignored';

export interface WebhookLog {
  id: string;
  event_type: string;
  paystack_ref: string | null;
  payload: Record<string, unknown>;
  status: WebhookStatus;
  error_message: string | null;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  platform_fee_percent: number;  // default 3 — Kiima's cut from creator
  default_tag_amount_ngn: number;
  default_tag_amount_usd: number;
  default_tag_amount_gbp: number;
  default_tag_amount_eur: number;
  maintenance_mode: boolean;
  updated_at: string;
}

// Profile extended with admin flag — only used in admin context
export interface ProfileWithAdmin extends Profile {
  is_admin: boolean;
  suspended: boolean;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin' | 'website';

export interface SocialLink {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  url: string;
  display_order: number;
  created_at: string;
}
```

---

## 9. KEY UTILITY FUNCTIONS

These must be used consistently. Never inline their logic.

### `formatCurrency(amount, currency)`
```typescript
// lib/utils/currency.ts
// Always use this. Never manually concatenate ₦ + number.
formatCurrency(5000, 'NGN')  // → "₦5,000"
formatCurrency(20, 'USD')    // → "$20.00"
```

### `toKobo(amount)`
```typescript
// lib/utils/currency.ts
// Paystack requires amounts in kobo (NGN × 100). Always convert before API calls.
toKobo(10250)  // → 1025000
// Never send naira directly to Paystack — always convert to kobo first.
```

### `resolveDisplayName(displayName, isAnonymous)`
```typescript
// lib/utils/display-name.ts
// Always use this for contribution display.
// Never inline the anonymous logic.
resolveDisplayName("Victor", false)  // → "Victor"
resolveDisplayName(null, false)      // → "Anonymous"
resolveDisplayName("Victor", true)   // → "Anonymous"
resolveDisplayName(null, true)       // → "Anonymous"
```

### `formatContributionLine(contribution)`
```typescript
// Produces: "Victor sent ₦5,000" or "Anonymous bought a coffee ☕"
// Uses gift_amount for the display value — not total_charged.
// Always use this. Never format contributions inline.
```

### `calculateAllFees(giftAmount, feePercent)`
```typescript
// lib/utils/fee.ts
// THE master fee function — always use this, never calculate fees individually.
// feePercent comes from platform_settings.platform_fee_percent — never hardcode 3.
// NGN formula: paystack_fee = min((gift_amount × 0.015) + 100, 2000)
calculateAllFees(10000, 3)
// → {
//     gift_amount:    10000,   // what gifter intends to send
//     paystack_fee:   250,     // added on top — paid by gifter
//     kiima_fee:      300,     // deducted from creator via Paystack split
//     creator_amount: 9700,    // what creator actually receives
//     total_charged:  10250,   // what Paystack charges the gifter
//   }
```

### `formatFeeBreakdown(giftAmount, feePercent, currency)`
```typescript
// lib/utils/fee.ts
// Returns human-readable strings for the gift form live fee display.
// Used in GiftForm and ContributeForm — shown to gifter before they pay.
formatFeeBreakdown(10000, 3, 'NGN')
// → {
//     giftLine:   "You're sending ₦10,000",
//     feeLine:    "Processing fee ₦250",
//     totalLine:  "Total charged ₦10,250",
//   }
```

---

## 10. V1 OUT OF SCOPE — DO NOT BUILD

If any of the following is suggested, stop and re-read the spec.

```
❌ Real-time updates (WebSockets, Supabase Realtime)
❌ Push or email notifications
❌ In-app messaging between creator and supporter
❌ Wallet system (storing balance on-platform)
❌ Payout automation (bank transfer, etc.)
❌ Currency conversion
❌ Multi-currency per creator
❌ Analytics charts or graphs
❌ Social features (follow, share counts, leaderboards)
❌ Recurring gifts / subscriptions
❌ Tip goals on direct gifts (only pools have goals)
❌ Comment or message with gift
❌ Creator verification badges
❌ Mobile app (web only, mobile-first)
```

> ✅ Admin panel IS in scope — see Section 15.

---

## 11. ENVIRONMENT VARIABLES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server/webhook only — never expose to client

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=  # use test key until go-live
PAYSTACK_SECRET_KEY=              # use test key until go-live
PAYSTACK_WEBHOOK_SECRET=          # webhook signature verification

# App
NEXT_PUBLIC_APP_URL=              # https://kiima.co (or localhost)
```

---

## 12. BEFORE YOU WRITE ANY CODE — CHECKLIST

Run through this before every code generation. Every session.

```
□ Have I read CLAUDE.md in full this session?

□ Have I acknowledged the Standing Rules at the top of this file?
  → Section ⚡ — confirm: Section 7 and Section 14 will be updated when done.

□ Does a component already exist for what I'm about to build?
  → Check Section 7 (Component Inventory)

□ Am I using design tokens (CSS variables), not hardcoded values?
  → Check Section 3.1

□ Does this touch the anonymous identity system?
  → Re-read Section 4.3 before proceeding

□ Does this touch payment or webhook logic?
  → Re-read Section 4.6 before proceeding

□ Does this touch contribution display?
  → Use formatContributionLine() — re-read Section 4.5

□ Am I using formatCurrency() for all money display?

□ Am I using resolveDisplayName() for all name display?

□ Does this feature appear in the Out of Scope list?
  → Section 10 — if yes, stop.

□ Does this touch social links or the ProfileCard?
  → Re-read Section 4.8 before proceeding.
  → Confirm: showLinkBar is false on public page, URL validation 
    is applied before saving, SocialLinksRow renders nothing if empty.

□ Am I building something inside /admin?
  → Re-read Section 15 before proceeding.
  → Confirm: is_admin check is server-side, actions are in admin.actions.ts,
    data fetches use the admin Supabase client, no anonymous identity is exposed.

□ Is my copy warm, short, and human?
  → Section 3.5

□ Does every new card follow the card system rules?
  → Section 3.3

□ Have I placed the file in the correct folder?
  → Section 6

□ BEFORE FINISHING: Have I updated Section 7 (Component Inventory)?
□ BEFORE FINISHING: Have I appended this session's entry to BUILD_LOG.md?
  → These are required. Task is not complete without them.
```

---

## 13. NAMING CONVENTIONS

```
Components:   PascalCase              → GiftTagPill.tsx
Utilities:    camelCase               → formatCurrency.ts
Server actions: camelCase.actions.ts  → gift.actions.ts
Routes:       kebab-case (Next.js)
DB columns:   snake_case
TS types:     PascalCase
CSS classes:  kebab-case with k- prefix → k-card, k-tag-pill

Branch naming:
  feature/gift-tags
  fix/anonymous-toggle
  chore/db-schema-update
```

---

## 14. SESSION HANDOFF NOTES

> Full build history is in BUILD_LOG.md in the project root.
> Read BUILD_LOG.md at the start of any session that needs
> historical context. For most coding sessions, it is not needed.

---

## 15. ADMIN PANEL

The admin panel is for the platform owner only. It is built in Phase 8, after the creator and gifter experience is complete.

---

### 15.1 Access Control Rules

```
Rule 1: The admin area lives at /admin — completely separate from /dashboard.

Rule 2: Access is controlled by the is_admin boolean on the profiles table.
        - Default for all signups: false
        - Set to true manually in Supabase dashboard for the platform owner
        - NEVER expose is_admin as a field the user can set themselves
        - NEVER build a UI to promote a user to admin
        - NEVER check is_admin on the client — always check server-side

Rule 3: The admin layout.tsx middleware must:
        - Read the session server-side
        - Fetch the profile and check is_admin === true
        - Redirect non-admins to /dashboard immediately
        - A logged-out user hitting /admin → redirect to /login

Rule 4: All admin data fetches use lib/supabase/admin.ts (service role client).
        Regular anon or user-scoped clients are never used in admin routes.

Rule 5: Admin actions (suspend creator, force-close pool, delete tag, update 
        settings) are server actions in lib/actions/admin.actions.ts only.
        Never inline admin mutations in page components.
```

---

### 15.2 Admin Pages & What Each Does

**`/admin` — Platform Overview**
The first thing you see when you log in as admin. Shows:
- Total creators (all time + new this week)
- Total platform volume — all money processed (all currencies shown separately)
- Total contributions (count, all time)
- Total active pools right now
- New creator signups (last 7 days, shown as a simple list)
- Any contributions stuck in "pending" status for more than 1 hour (warning flag)

**`/admin/creators` — Creator Management**
- Full list of all creator accounts, newest first
- Search by username, display name, or email
- Each row shows: avatar, name, username, currency, join date, total received, status
- Click a creator → goes to `/admin/creators/[id]`

**`/admin/creators/[id]` — Individual Creator Detail**
- Full profile info
- Their gift tags (all, including default)
- Their pools (all, with status)
- Their full contribution history (received)
- Actions available:
  - **Suspend account** — sets a `suspended: true` flag, blocks their gift page from loading, shows a "this creator is unavailable" message to visitors. Does not delete data.
  - **Unsuspend account**
  - No account deletion in V1

**`/admin/transactions` — Full Transaction Log**
- Every contribution across the entire platform
- Columns: date, creator (recipient), gifter name, amount, currency, tag used, pool (if any), Paystack ref, status
- Filterable by: status (pending/confirmed), date range, creator
- Search by Paystack reference (for support queries — "I paid but it didn't show up")
- If a contribution is stuck in "pending" → show a "re-check with Paystack" button that calls the Paystack verify endpoint and updates status if confirmed

**`/admin/pools` — Pool Oversight**
- Every pool across the platform
- Columns: title, creator, goal, raised, % complete, contributor count, status, created date
- Filter by: open / closed
- Action: **Force close** any pool — same effect as creator closing it, but admin-initiated
- Click a pool → see its full contributor list

**`/admin/tags` — Tag Moderation**
- Every custom tag across all creators (excludes system default tags)
- Shows: label, amount, currency, creator username, created date
- Action: **Delete tag** — removes it from the creator's tag list immediately
- Use case: offensive or inappropriate tag labels

**`/admin/webhooks` — Webhook Event Log**
- Every event received from Paystack at /api/webhooks/paystack
- Columns: timestamp, event type, Paystack ref, status (processed/failed/ignored), error message
- Failed webhooks are highlighted in red — these need attention
- Ignored webhooks (non-charge.success events) shown in muted style
- No actions — this is read-only. It is a diagnostic tool.

**`/admin/settings` — Platform Settings**
- Default "Buy me a coffee" tag amounts per currency:
  - NGN: ₦[amount] (default 2,000)
  - USD: $[amount] (default 2)
  - GBP: £[amount] (default 2)
  - EUR: €[amount] (default 2)
- Maintenance mode toggle:
  - When ON: all public pages (gift links, pool pages) show a "Kiima is temporarily unavailable" message. Dashboard still accessible for creators. Admin still accessible.
- Saving settings updates the single row in `platform_settings` table
- Changes take effect immediately on next page load

---

### 15.3 Admin Design Rules

The admin panel follows the same Kiima design system (cards, tokens, typography) with one distinction — it has a more functional, dense layout because it is a tool, not a product surface.

```
- Same card system, colours, and fonts as the rest of Kiima
- Table rows replace card grids where data is dense (transaction log, creator list)
- Danger actions (suspend, force-close, delete tag) use --color-danger and require
  a confirmation step before executing — never one-click destructive actions
- Admin nav is a persistent left sidebar on desktop — not a top nav
- Admin pages are NOT mobile-optimised — admin is a desktop-only tool
- Do not use warm copy tone in admin — clear, direct, functional language is correct here
```

---

### 15.4 Admin Component Inventory

Add to Section 7 as built:

| Component | File | Purpose |
|---|---|---|
| `AdminStatCard` | `cards/AdminStatCard.tsx` | Platform-level stat display |
| `CreatorRow` | `admin/CreatorRow.tsx` | Single creator in the creators list |
| `TransactionRow` | `admin/TransactionRow.tsx` | Single transaction in the log |
| `WebhookRow` | `admin/WebhookRow.tsx` | Single webhook event in log |
| `PoolAdminRow` | `admin/PoolAdminRow.tsx` | Single pool in admin pool list |
| `AdminConfirmDialog` | `admin/AdminConfirmDialog.tsx` | Confirmation modal for destructive actions |
| `PlatformSettingsForm` | `admin/PlatformSettingsForm.tsx` | Settings page form |

---

### 15.5 Admin Server Actions

All live in `lib/actions/admin.actions.ts`:

```typescript
suspendCreator(creatorId: string)       // sets suspended: true on profile
unsuspendCreator(creatorId: string)     // sets suspended: false on profile
forceClosePool(poolId: string)          // sets pool status to 'closed'
deleteCustomTag(tagId: string)          // validates not is_default, then deletes
updatePlatformSettings(settings: Partial<PlatformSettings>)
recheckPaystackPayment(paystackRef: string)  // calls Paystack verify, updates if confirmed
```

---

### 15.6 What the Admin Panel Must NEVER Do

```
❌ Delete creator accounts or their data
❌ View anonymous contributor identity (anonymity is absolute — even for admin)
❌ Move or transfer money
❌ Edit a creator's profile on their behalf
❌ Promote another user to admin via UI
❌ Access Paystack dashboard directly — use the Paystack API only
```


## 16. LANDING PAGE DESIGN BRIEF

### 16.1 Overview
The landing page (app/page.tsx) must mirror the uploaded reference image 
pixel-perfectly. Claude must use an iterative screenshot loop — taking 
screenshots, comparing against the reference, fixing issues, and repeating 
until the result matches exactly.

### 16.2 Reference Image
The reference image will be provided at the start of the landing page session.
It will be uploaded directly into the Claude Code conversation.
Treat it as the single source of truth for layout, spacing, typography, 
colours, and component structure.

### 16.3 Iterative Screenshot Loop — MANDATORY

Before declaring the page done, Claude MUST run this loop:

Step 1 — Write the initial page based on the reference image.

Step 2 — Install Puppeteer if not already installed:
  npm install puppeteer --save-dev

Step 3 — Create and run this screenshot script after every change:

  // scripts/screenshot.js
  const puppeteer = require('puppeteer');
  (async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: 'scripts/screenshot-desktop.png', 
      fullPage: true 
    });

    // Mobile
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: 'scripts/screenshot-mobile.png', 
      fullPage: true 
    });

    await browser.close();
    console.log('Screenshots saved.');
  })();

  Run with: node scripts/screenshot.js

Step 4 — After each screenshot, compare it against the reference image:
  - Check layout, spacing, font sizes, colours, alignment section by section
  - List every specific discrepancy found (do not generalise — be exact)
  - Fix each discrepancy in app/page.tsx
  - Re-run the screenshot script
  - Repeat

Step 5 — Only stop iterating when ALL of the following pass:

  DESKTOP CHECKLIST:
  □ Overall layout matches reference at 1440px width
  □ Navbar height, logo position, and CTA buttons match reference
  □ Hero section headline size, weight, and line height match reference
  □ Hero subtext size and colour match reference
  □ Hero CTA button shape, colour, and text match reference
  □ All section vertical spacing matches reference
  □ All card border radius, shadow, and padding match reference
  □ All font families render correctly (Fraunces display, Plus Jakarta Sans body)
  □ Colour values match reference exactly (use eyedropper logic)
  □ Images or mockups are positioned correctly
  □ Footer layout, link columns, and bottom bar match reference

  MOBILE CHECKLIST (390px):
  □ No horizontal scroll
  □ All sections stack to single column
  □ Navbar collapses — only logo and primary CTA visible
  □ Hero headline scales correctly
  □ All buttons are full width with min 44px tap height
  □ Font sizes remain readable without zooming
  □ Cards stack vertically with correct gap

  MINIMUM ITERATIONS: 5
  Do not stop before 5 complete screenshot-compare-fix cycles.
  If after 5 iterations discrepancies remain, continue until they are resolved.

### 16.4 Design System Constraints
Even while mirroring the reference, all of the following must hold:
  - All colours come from styles/tokens.css CSS variables — never hardcode hex
  - All spacing uses --space-* tokens
  - All border radii use --radius-* tokens
  - All shadows use --shadow-* tokens
  - Font families must be Fraunces (display) and Plus Jakarta Sans (body)
  - Primary accent remains #C87B5C (--color-accent)
  - Background remains #F6F3EE (--color-bg)

  Exception: if the reference image uses a colour not in the token system,
  add it to styles/tokens.css first, then use the variable.

### 16.5 Session Start Instructions
When starting the landing page session, paste this into Claude Code:

  "Read CLAUDE.md Section 16 fully before writing a single line of code.
   Here is the reference image: [upload image here]
   Build app/page.tsx to match this image exactly using the iterative 
   screenshot loop from Section 16.3. Do not stop until all checklist 
   items in Section 16.5 pass. Run a minimum of 5 screenshot iterations.
   npm run dev is already running on localhost:3000."

### 16.6 Output Files
When the session is complete, the following must exist:
  - app/page.tsx — the final landing page
  - scripts/screenshot.js — the screenshot script (commit this)
  - scripts/screenshot-desktop.png — final desktop result (do not commit)
  - scripts/screenshot-mobile.png — final mobile result (do not commit)

Add screenshot-desktop.png and screenshot-mobile.png to .gitignore.

Append this session's entry to BUILD_LOG.md when done.
---

*This document is the contract. When in doubt, refer back here. The spec is the truth.*
