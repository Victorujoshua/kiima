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
   → Update Section 14 (Session Handoff Notes) with:
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
   → Section 14 is updated ✓
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

### 4.6 Payment Flow

> ✅ **FEE MODEL DECIDED** — Kiima charges a **3% platform fee** on every 
> contribution. This is deducted from the amount before the creator receives it.
> 
> Fee calculation:
> - Supporter pays: full amount (e.g. ₦5,000)
> - Kiima fee (3%): ₦150
> - Creator receives: ₦4,850
>
> Rules:
> - Fee is calculated server-side only — never on the client
> - The full amount the supporter entered is what Paystack charges
> - The fee and net amount are recorded on the contribution row
> - The fee is never shown to the supporter — they see only what they're sending
> - The creator's dashboard shows the net amount they received (after fee)
> - The admin dashboard shows both gross and fee for every transaction

```
1. User fills form (tag or custom amount, optional name, anonymous toggle)
2. Click CTA → validate (amount > 0)
3. Server action:
   a. Calculate fee: fee = amount * 0.03 (rounded to 2 decimal places)
   b. Calculate net: net_amount = amount - fee
   c. Create PENDING contribution record with amount, fee, net_amount
   d. Initialize Paystack transaction for the full amount
4. Redirect to Paystack checkout
5. Paystack redirects back to success URL on completion
6. Paystack fires webhook to /api/webhooks/paystack
7. Webhook handler:
   a. Verify Paystack signature
   b. Update contribution status from 'pending' to 'confirmed'
   c. Update pool total by net_amount (if pool contribution)
8. Success page shown to user
```

**Critical:** Never record a contribution before webhook confirmation. The redirect success page is UI only — the DB write happens in the webhook. If webhook fails, the contribution is NOT recorded.

### 4.7 Creator Dashboard Data

The dashboard is **read-only aggregated data**. It shows:
- Total gifts received (sum of all direct gifts)
- Total pool contributions (sum of all pool contributions)
- Total gift count (count of all contributions)
- Transaction list (all contributions, newest first)
- Gift tag management (CRUD, except default tag)
- Support pool list with status and progress

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
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid REFERENCES profiles(id),         -- creator receiving the gift
  pool_id       uuid REFERENCES support_pools(id),    -- null if direct gift
  tag_id        uuid REFERENCES gift_tags(id),        -- null if custom amount
  amount        numeric NOT NULL,                     -- full amount supporter paid
  fee           numeric NOT NULL DEFAULT 0,           -- 3% platform fee
  net_amount    numeric NOT NULL,                     -- amount - fee (what creator receives)
  currency      text NOT NULL,
  display_name  text,                                 -- null if anonymous
  is_anonymous  boolean DEFAULT false,
  paystack_ref  text UNIQUE NOT NULL,                 -- Paystack payment reference
  status        text DEFAULT 'pending',               -- 'pending' | 'confirmed'
  created_at    timestamptz DEFAULT now()
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
  default_tag_amount_ngn  numeric NOT NULL DEFAULT 2000,
  default_tag_amount_usd  numeric NOT NULL DEFAULT 2,
  default_tag_amount_gbp  numeric NOT NULL DEFAULT 2,
  default_tag_amount_eur  numeric NOT NULL DEFAULT 2,
  maintenance_mode        boolean DEFAULT false,
  updated_at              timestamptz DEFAULT now()
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
│   │   └── PoolCreateForm.tsx
│   │
│   ├── shared/                        ← Reusable atoms
│   │   ├── GiftTagPill.tsx
│   │   ├── AnonymousToggle.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ContributionRow.tsx
│   │   ├── CurrencyInput.tsx
│   │   └── KiimaButton.tsx
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
│   │   └── tag.actions.ts
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

| Component | File | Purpose | Key Props |
|---|---|---|---|
| `ProfileCard` | `cards/ProfileCard.tsx` | Avatar (img or initials fallback), display name, @username, bio, copy-link pill bar | `profile: Profile` |
| `GiftActionCard` | `cards/GiftActionCard.tsx` | Tag pills via GiftTagPill + CurrencyInput; uncontrolled by default, accepts optional controlled props for payment form | `tags: GiftTag[], currency: Currency, selectedTag?, onTagSelect?, onAmountChange?` |
| `SupportPoolCard` | `cards/SupportPoolCard.tsx` | Pool title, progress bar, status | `pool: SupportPool` |
| `ContributionFeedCard` | `cards/ContributionFeedCard.tsx` | Up to 10 most recent contributions via ContributionRow; empty state: "No gifts yet — be the first to show love ❤️" | `contributions: Contribution[]` |
| `DashboardStatCard` | `cards/DashboardStatCard.tsx` | Compact stat card: metadata label (uppercase 11px), large bold value (28px), muted sub text | `label: string, value: string, sub: string` |

### Forms

| Component | File | Purpose | Key Props |
|---|---|---|---|
| `GiftForm` | `forms/GiftForm.tsx` | Tag pills + CurrencyInput + name input + AnonymousToggle + submit; calls `initializeGift`; SubmitButton sub-component uses `useFormStatus` for loading state; redirect to Paystack on success | `recipientId: string, tags: GiftTag[], currency: Currency` |
| `ContributeForm` | `forms/ContributeForm.tsx` | Pool contribution form | `poolId, tags, currency, isClosed` |
| `PoolCreateForm` | `forms/PoolCreateForm.tsx` | Create new support pool | `creatorId` |

### Shared Atoms

| Component | File | Purpose | Key Props |
|---|---|---|---|
| `GiftTagPill` | `shared/GiftTagPill.tsx` | Tag selection button | `tag, selected, onSelect, currency` |
| `AnonymousToggle` | `shared/AnonymousToggle.tsx` | Toggle + identity preview — implements Section 4.3 Rule 4 exactly | `isAnon, displayName?, onChange` |
| `ProgressBar` | `shared/ProgressBar.tsx` | Pool progress bar | `raised, goal, currency` |
| `ContributionRow` | `shared/ContributionRow.tsx` | Renders formatContributionLine() output + date; isLast prop removes bottom border | `contribution: Contribution, isLast?: boolean` |
| `CurrencyInput` | `shared/CurrencyInput.tsx` | Large amount input with currency symbol prefix; readOnly locks field when tag selected | `currency: Currency, value, onChange?, readOnly?` |
| `KiimaButton` | `shared/KiimaButton.tsx` | Primary CTA button — variants: primary (dark #1C1916), ghost (terracotta text), danger (red soft→solid on hover); spinner on loading | `children, onClick?, loading?, disabled?, type?, variant?, fullWidth?` |

### Auth Pages

| Route | File | Purpose |
|---|---|---|
| `/signup` | `app/(auth)/signup/page.tsx` | Creator sign-up — display name, username, email, password, currency |
| `/login` | `app/(auth)/login/page.tsx` | Creator login — email + password |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Request password reset email |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Set new password after clicking reset link |

### API Routes

| Route | File | Purpose |
|---|---|---|
| `/api/auth/callback` | `app/api/auth/callback/route.ts` | Supabase PKCE code exchange — redirects to `?next=` param |
| `/api/webhooks/paystack` | `app/api/webhooks/paystack/route.ts` | Paystack webhook handler — verifies HMAC-SHA512 signature, handles charge.success (confirms contribution + increments pool raised), ignores other events, logs all events to webhook_logs via admin client |

### Server Actions

| Action file | Exports | Purpose |
|---|---|---|
| `lib/actions/auth.actions.ts` | `signupAction`, `loginAction`, `forgotPasswordAction`, `resetPasswordAction` | Auth flows: create user + profile + default tag; sign in; password reset |
| `lib/actions/tag.actions.ts` | `getTagsByUser`, `createTag`, `deleteTag` | Tag CRUD — deleteTag guards is_default; createTag validates label + amount |
| `lib/actions/gift.actions.ts` | `initializeGift` | Parses form, calculates 3% fee + net_amount, inserts PENDING contribution via admin client, calls initializePaystackTransaction with caller-generated reference, redirect()s to Paystack authorization URL; cleans up pending row on Paystack failure |

### Paystack Library

| File | Exports | Purpose |
|---|---|---|
| `lib/paystack/initialize.ts` | `initializePaystackTransaction` | POST to Paystack initialize; converts amount to subunits; returns `{ authorizationUrl, reference }` |
| `lib/paystack/webhook.ts` | `verifyPaystackSignature` | HMAC-SHA512 verification of x-paystack-signature header; uses timingSafeEqual |
| `lib/paystack/verify.ts` | `verifyPaystackTransaction` | GET Paystack /transaction/verify/:reference; used by admin recheckPaystackPayment |

### Dashboard Shell

| File | Purpose |
|---|---|
| `app/dashboard/layout.tsx` | Server Component shell: reads session (redirects if absent), fetches profile; renders sidebar (desktop) + `DashboardNav` + creator info + `LogoutButton`; mobile bottom tab bar via second `DashboardNav` |
| `app/dashboard/DashboardNav.tsx` | `'use client'` — `variant: 'sidebar' \| 'tabs'`; uses `usePathname` for active highlighting; exact match for `/dashboard`, `startsWith` for sub-routes |
| `app/dashboard/LogoutButton.tsx` | `'use client'` — calls `supabase.auth.signOut()` then `router.push('/login')` |

### Dashboard Pages

| Route | File | Purpose |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Overview: 3 DashboardStatCards (gifts received, pool support, total count) + 5 most recent ContributionRows; all stats fetched in parallel |
| `/dashboard/tags` | `app/dashboard/tags/page.tsx` + `TagsClient.tsx` | Gift tag management — list all tags, SYSTEM badge on default, Remove on custom, inline add form |

### Public Pages

| Route | File | Purpose |
|---|---|---|
| `/[username]` | `app/[username]/page.tsx` | Public gift link page — fetches profile + tags + confirmed direct contributions in parallel; left col: ProfileCard + ContributionFeedCard; right col: GiftForm |
| `/[username]` (not found) | `app/[username]/not-found.tsx` | Friendly 404 when username doesn't exist |

### Database Migrations

| File | Purpose |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | All tables, RLS policies, platform_settings seed row |
| `supabase/migrations/002_default_tag_trigger.sql` | AFTER INSERT trigger on profiles — inserts default "Buy me a coffee ☕" tag using per-currency amount from platform_settings |

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
  amount: number;           // full amount supporter paid
  fee: number;              // 3% platform fee
  net_amount: number;       // amount - fee (what creator receives)
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
// Always use this. Never format contributions inline.
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
□ BEFORE FINISHING: Have I updated Section 14 (Session Handoff Notes)?
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

> Use this section to leave notes for the next session.
> Always update before ending a session.

```
Last updated: 2026-04-11
Last session: Phase 2 / Session 2.2 — Gift tag management page + formatCurrency util

  Session 0.2 recap:
  - Created styles/tokens.css with all design tokens from Section 3.1
  - Rewrote app/globals.css and app/layout.tsx (Fraunces + Plus Jakarta Sans)
  - Replaced app/page.tsx with token smoke-test card

  Session 0.3 completed:
  - types/index.ts — all shared TypeScript types from Section 8 (Currency,
    PoolStatus, ContributionStatus, Profile, GiftTag, SupportPool, Contribution,
    WebhookLog, PlatformSettings, ProfileWithAdmin)
  - lib/supabase/client.ts — browser client using @supabase/ssr createBrowserClient
  - lib/supabase/server.ts — server client using @supabase/ssr createServerClient
    with Next.js cookies() integration (handles read-only Server Component context)
  - lib/supabase/admin.ts — service role client using @supabase/supabase-js
    createClient with SUPABASE_SERVICE_ROLE_KEY, autoRefreshToken/persistSession off
  - supabase/migrations/001_initial_schema.sql — full schema: all 6 tables
    (profiles, gift_tags, support_pools, contributions, webhook_logs,
    platform_settings), RLS enabled on all tables, all policies from Section 5,
    platform_settings seed row inserted, suspended column added to profiles
    (needed by admin suspend/unsuspend actions from Section 15.5)

  Note: lib/utils/ files (currency.ts, display-name.ts, slug.ts) were already
  created as empty stubs in a prior setup step — they still need their
  implementations filled in.

  Session 1.1 completed:
  - app/globals.css: added shared CSS utility classes — .k-input (with :focus,
    :placeholder, --error modifier), .k-btn / .k-btn--primary / .k-btn--ghost /
    .k-btn--full (with :hover, :active, :disabled), .k-currency-pill /
    .k-currency-pill--selected
  - components/shared/KiimaButton.tsx: implemented — uses CSS classes, supports
    variant (primary|ghost), fullWidth, loading (shows "Just a moment…"), disabled,
    type (button|submit|reset), onClick
  - lib/actions/auth.actions.ts: two server actions —
      signupAction: validates fields, creates auth user, inserts profile row via
        admin client, inserts default "Buy me a coffee ☕" gift tag, handles
        email-confirmation-required state, returns fieldErrors per field
      loginAction: signs in with Supabase, returns success or error state
    Both return state objects (no redirect() — client handles navigation)
  - app/(auth)/signup/page.tsx: 'use client' — useFormState(signupAction),
    controlled username input (live kiima.co/username preview, auto-strips invalid
    chars), currency pill selector (NGN default), per-field inline error display,
    email confirmation screen, redirects to /dashboard on immediate session
  - app/(auth)/login/page.tsx: 'use client' — useFormState(loginAction),
    useFormStatus-powered SubmitButton, redirects to /dashboard on success

  Session 1.2 completed:
  - middleware.ts (project root) — Next.js middleware using @supabase/ssr
    createServerClient with request/response cookie passthrough (required pattern
    for session refresh in middleware).
    Rules enforced:
      • /dashboard/* and /admin/* without session → redirect /login
      • /login or /signup with active session → redirect /dashboard
      • Public routes unaffected: /, /[username], /[username]/pool/[slug]
    Matcher excludes: _next/static, _next/image, favicon.ico, api/webhooks,
    api/auth/callback (Paystack webhook + Supabase PKCE callback must not be
    blocked by auth middleware)

  Session 1.3 completed:
  - Password visibility toggle (eye icon) added to:
      • app/(auth)/login/page.tsx — password field
      • app/(auth)/signup/page.tsx — password field
    Uses inline SVG EyeIcon/EyeOffIcon, showPassword state, position:relative
    wrapper with absolute-positioned toggle button. paddingRight on input so
    text doesn't overlap icon.
  - "Forgot password?" link added to login page — appears inline next to the
    password label (right-aligned), links to /forgot-password
  - app/(auth)/forgot-password/page.tsx — email form, calls forgotPasswordAction,
    shows inbox confirmation screen on success (same pattern as email confirm screen
    on signup). Authenticated users redirected to /dashboard by middleware.
  - app/(auth)/reset-password/page.tsx — two password fields (new + confirm) each
    with eye toggle, calls resetPasswordAction, success screen with auto-redirect
    to /login after 2s.
  - app/api/auth/callback/route.ts — GET handler for Supabase PKCE code exchange.
    Reads ?code= and ?next= params, calls exchangeCodeForSession, redirects to
    next path. Falls back to /login?error=link_expired on failure.
  - lib/actions/auth.actions.ts — two new server actions added:
      forgotPasswordAction: calls resetPasswordForEmail with redirectTo pointing
        to /api/auth/callback?next=/reset-password. Always returns success to
        prevent email enumeration.
      resetPasswordAction: validates length (≥8) and match, calls updateUser.
  - middleware.ts updated: /forgot-password added to the list of routes that
    redirect authenticated users to /dashboard.

  Session 1.4 completed:
  - components/shared/KiimaButton.tsx — updated:
      • Added danger variant: soft red bg → solid red + white text on hover
      • Primary variant now uses var(--color-text-primary) (#1C1916) as bg
      • Loading state replaced "Just a moment…" text-only with spinner (.k-spinner)
        + text side-by-side
      • Ghost variant gained active:scale(0.98) to match interaction standard
  - app/globals.css — updated:
      • .k-btn--primary bg changed from var(--color-accent) to var(--color-text-primary)
      • Added .k-btn--danger and .k-btn--ghost:active rules
      • Added @keyframes k-spin and .k-spinner for button loading spinner
  - components/shared/AnonymousToggle.tsx — implemented:
      • Custom pill toggle switch: terracotta when ON, muted grey when OFF
      • Thumb slides left/right via justify-content (no JS transform needed)
      • Preview text: "👤 You'll appear as [name/Anonymous]"
      • Implements Section 4.3 Rule 4 exactly — "your name" fallback when no name
      • role="switch" + aria-checked for accessibility
  - components/shared/CurrencyInput.tsx — implemented:
      • Symbol prefix (₦/$/ £/€) absolutely positioned inside input
      • 22px bold font for amount — visually prominent
      • readOnly=true: bg changes to var(--color-bg), text muted, cursor:default
      • Strips non-numeric characters on change (digits only)
      • Uses Currency type from types/index.ts

  Session 2.1 completed:
  - supabase/migrations/002_default_tag_trigger.sql — AFTER INSERT trigger on profiles:
      • Function: create_default_gift_tag(), SECURITY DEFINER, SET search_path = public
      • Looks up per-currency default amount from platform_settings using CASE on
        NEW.currency (NGN/USD/GBP/EUR → correct column). Hard fallback to 2000 if
        platform_settings is empty.
      • Inserts gift_tags row: label="Buy me a coffee ☕", is_default=true
      • DROP TRIGGER IF EXISTS before CREATE makes migration idempotent
      • This means signupAction's manual tag insert (in auth.actions.ts) is now
        redundant — the trigger handles it. Both can coexist safely (one will
        just no-op if the other runs first) but the trigger is the authoritative path.
  - lib/actions/tag.actions.ts — three server actions:
      getTagsByUser(userId): SELECT all tags for creator, default first (is_default
        DESC), then by created_at ASC. Returns GiftTag[] — empty array on error.
      createTag(_prevState, formData): validates label (required, ≤60 chars) and
        amount (numeric, >0). Inserts with is_default=false always. Returns
        CreateTagState { fieldErrors?, error?, success?, tag? }.
      deleteTag(tagId, userId): fetches tag first to verify ownership and is_default.
        Returns { error: 'The default tag cannot be deleted.' } if is_default=true.
        Only proceeds to DELETE after passing the is_default check. RLS policy
        also enforces is_default=false as a second layer.

  Session 2.2 completed:
  - lib/utils/currency.ts — formatCurrency(amount, currency) implemented:
      • NGN → ₦5,000 (0 decimal places, en locale thousands separator)
      • USD → $20.00 (2 decimal places)
      • GBP → £15.00 (2 decimal places)
      • EUR → €20.00 (2 decimal places)
      • Manual symbol prefix guarantees correct character regardless of ICU build
      • Matches Section 9 spec exactly
  - app/dashboard/tags/page.tsx — Server Component:
      • Gets session via supabase.auth.getSession(), redirects to /login if absent
      • Fetches profile.currency for the creator
      • Calls getTagsByUser(session.user.id) to load all tags
      • Passes tags, userId, currency to TagsClient
  - app/dashboard/tags/TagsClient.tsx — Client Component:
      • Lists all tags in a single card; each tag row is a border-divided li
      • Default tag shows terracotta "SYSTEM" badge (accent-soft bg); no remove button
      • Custom tags show "Remove" button in --color-danger; calls deleteTag directly
      • deleteTag sets deletingId state → button shows "Removing…" + is disabled
      • Delete errors surface inline below the list
      • "+ Add a new tag" text button reveals TagAddForm inline (no page navigation)
      • TagAddForm is a separate sub-component → gets a fresh useFormState every
        mount (so closing + reopening resets form state and validation errors)
      • Form fields: label (text, emoji encouraged), amount (number, currency hint
        in placeholder). Hidden user_id input. Per-field errors from createTag.
      • On successful create: form closes, router.refresh() re-fetches from server
      • On successful delete: router.refresh() re-fetches from server
      • useTransition wraps router.refresh() to avoid blocking UI
      • formatCurrency used for all amount display — no inline formatting

  Session 2.3 completed:
  - components/shared/GiftTagPill.tsx — implemented:
      • Props: tag (GiftTag), selected (boolean), onSelect (GiftTag | null) => void,
        currency (string)
      • Unselected: white bg, faint border, var(--color-text-secondary) text
      • Hover (unselected): accent-soft bg, accent border + text, translateY(-1px)
      • Selected: solid var(--color-accent) bg, white text
      • Active: scale(0.98) per Section 3.4
      • Click deselects if already selected (passes null to onSelect), selects otherwise
      • Label format: "{tag.label} · {formatCurrency(tag.amount, currency)}"
      • aria-pressed={selected} for accessibility
  - app/globals.css — added .k-tag-pill base, :hover:not(--selected), :active,
    and .k-tag-pill--selected rules

  Session 3.1 completed:
  - components/cards/ProfileCard.tsx — implemented ('use client'):
      • Avatar: shows img if avatar_url, otherwise terracotta initials circle
        (up to 2 letters from display_name split on spaces)
      • Display name — Fraunces 500 26px
      • @username — body 14px muted
      • Bio — body 14px line-height 1.65, conditional render if bio exists
      • Copy-link pill bar: shows "kiima.co/{username}" + "Copy link" / "Copied!" label;
        writes "https://kiima.co/{username}" to clipboard; resets after 2s
  - components/cards/GiftActionCard.tsx — implemented ('use client'):
      • "Send a gift" heading; renders all tags as GiftTagPill components
      • When tag selected: CurrencyInput filled with tag.amount, readOnly=true,
        hint text: "Tap the tag again to deselect and enter a custom amount."
      • When no tag: CurrencyInput is editable, label "How much?"
      • Uncontrolled by default (internal useState); accepts optional controlled props
        (selectedTag, onTagSelect, onAmountChange) for connection to payment form in Phase 4
  - app/[username]/page.tsx — Server Component:
      • Fetches profile by username from Supabase (.eq('username', params.username))
      • If not found → notFound() triggers not-found.tsx
      • Calls getTagsByUser(profile.id) to load tags
      • Renders ProfileCard + GiftActionCard in two-column auto-fit grid (minmax 300px)
      • max-width 1080px, 16px gap, 40px/20px padding
  - app/[username]/not-found.tsx — friendly 404 page:
      • 🌿 emoji, "Creator not found" heading (Fraunces), body copy, "Go home" link
      • Centered card layout, matches design system

  Session 3.2 completed:
  - lib/utils/display-name.ts — implemented:
      • resolveDisplayName(displayName, isAnonymous): all 4 cases from Section 9 —
        ("Victor", false) → "Victor", (null, false) → "Anonymous",
        ("Victor", true) → "Anonymous", (null, true) → "Anonymous"
      • formatContributionLine(contribution): Section 4.5 exactly —
        anonymous + is_default tag → "Anonymous bought a coffee ☕"
        all other cases → "{name} sent {formatCurrency(amount, currency)}"
  - lib/actions/gift.actions.ts — stub server action:
      • submitGiftAction(_prevState, formData): validates recipientId + amount > 0,
        console.logs all fields, returns { success: true }
      • Phase 4 replaces this with Paystack initialization
      • Never records a contribution — DB write is webhook-only (Section 4.6)
  - components/forms/GiftForm.tsx — implemented ('use client'):
      • Tag pills via GiftTagPill; selecting fills CurrencyInput and locks it;
        deselecting clears amount and unlocks
      • CurrencyInput for amount (auto-filled/locked when tag selected)
      • Name input — controlled, feeds into AnonymousToggle preview
      • AnonymousToggle — implements Section 4.3 Rule 4 live identity preview
      • Hidden inputs: recipient_id, tag_id, is_anonymous, amount (FormData bridge)
      • Submit button "Send gift ❤️" — disabled when amount = 0 / empty
      • Hint shown below button when disabled: "Choose a tag or enter an amount"
      • On state.success: replaces form with 🙏 success screen
      • Global error displayed above button if state.error set
  - components/shared/ContributionRow.tsx — implemented (Server Component):
      • Uses formatContributionLine() — never inlines contribution display logic
      • Shows formatted line + short date (e.g. "12 Apr")
      • isLast prop removes bottom border on final row
  - components/cards/ContributionFeedCard.tsx — implemented (Server Component):
      • Slices to first 10 contributions
      • Empty state: "No gifts yet — be the first to show love ❤️"
      • Renders ContributionRow list with border dividers
  - app/[username]/page.tsx — updated:
      • Fetches tags + confirmed direct contributions (pool_id IS NULL) in parallel
      • Joins gift_tags on contributions for is_default check in formatContributionLine
      • Layout: left col (ProfileCard + ContributionFeedCard), right col (GiftForm)
      • Replaced GiftActionCard with GiftForm

  Session 3.3 completed:
  - app/globals.css — added dashboard shell CSS:
      • .k-dash-shell (flex min-height:100vh), .k-dash-sidebar (220px sticky,
        hidden on mobile, display:flex on ≥768px), .k-dash-main (flex:1,
        padding-bottom:72px on mobile for tab bar clearance),
        .k-dash-tabs (position:fixed bottom, 64px, hidden on ≥768px)
      • .k-nav-link / .k-nav-link--active — sidebar nav links with hover/active states
      • .k-tab-link / .k-tab-link--active — mobile tab link styles
  - app/dashboard/layout.tsx — Server Component:
      • Reads session (redirects /login if absent), fetches display_name + username
      • Renders: Kiima brand wordmark, DashboardNav (sidebar), spacer, creator section
        (avatar initial circle, display name, "View my gift page →" link, LogoutButton)
      • Imports DashboardNav variant="tabs" for mobile bottom tab bar
  - app/dashboard/DashboardNav.tsx — 'use client':
      • variant: 'sidebar' | 'tabs'
      • usePathname() for active state — exact match for /dashboard, startsWith for sub-routes
      • Sidebar: renders k-nav-link elements (Overview, Transactions, Gift Tags, Pools)
      • Tabs: renders k-dash-tabs nav with shorter labels (Home, Gifts, Tags, Pools)
  - app/dashboard/LogoutButton.tsx — 'use client':
      • createClient() (browser), supabase.auth.signOut(), router.push('/login'), router.refresh()
  - components/cards/DashboardStatCard.tsx — implemented (Server Component):
      • Compact 24px padding card per Section 3.3
      • Label: uppercase 11px faint; Value: 28px bold primary; Sub: 13px muted
  - app/dashboard/page.tsx — Server Component:
      • Reads session, fetches profile.currency + profile.display_name
      • 4 Supabase queries run in parallel via Promise.all:
        1. direct gift amounts (pool_id IS NULL)
        2. pool contribution amounts (pool_id IS NOT NULL)
        3. total confirmed count (head: true)
        4. 5 most recent with gift_tags join for formatContributionLine
      • Sums amounts in JS (safe for V1 data volumes)
      • 3-column stat grid (auto-fit minmax 180px)
      • Recent gifts section in a card using ContributionRow
      • Empty state: "No gifts yet — share your gift link to get started!"

  Session 4.1 completed:
  - types/index.ts — added fee: number and net_amount: number to Contribution interface
  - lib/paystack/initialize.ts — implemented initializePaystackTransaction():
      • POST https://api.paystack.co/transaction/initialize
      • Authorization: Bearer ${PAYSTACK_SECRET_KEY}
      • amount converted to subunits (x100) inside the function
      • Passes reference (caller-generated), callback_url, metadata
      • Throws on non-OK response or Paystack status: false
      • Returns { authorizationUrl, reference }
  - lib/actions/gift.actions.ts — replaced submitGiftAction stub with initializeGift:
      • Parses form: recipient_id, tag_id, amount, display_name, is_anonymous
      • Validates amount > 0
      • Calculates fee = Math.round(amount * 0.03 * 100) / 100
      • Calculates net_amount = Math.round((amount - fee) * 100) / 100
      • Generates reference: kma_{Date.now()}_{12-char uuid fragment}
      • Fetches creator profile (currency, username) via createAdminClient()
      • Inserts PENDING contribution row via admin client (bypasses RLS)
      • Calls initializePaystackTransaction with reference, callbackUrl, metadata
      • redirect(authorizationUrl) — re-throws isRedirectError so Next.js handles it
      • On Paystack failure: deletes the pending row, returns { error: '...' }
      • Email placeholder: 'gift@kiima.co' (gifter email not collected in V1)
      • callbackUrl: {NEXT_PUBLIC_APP_URL}/{username}?gift=success
  - components/forms/GiftForm.tsx — updated:
      • Imports initializeGift instead of submitGiftAction
      • useFormState(initializeGift, null) replaces submitGiftAction
      • Removed success screen (redirect to Paystack handles the flow)
      • Added SubmitButton sub-component using useFormStatus — shows loading
        spinner while form is pending (Paystack init or redirect in flight)
      • Removed unused success screen styles (successEmojiStyle etc.)

  Session 4.2 completed:
  - lib/paystack/webhook.ts — verifyPaystackSignature(rawBody, signature):
      • HMAC-SHA512 using PAYSTACK_WEBHOOK_SECRET
      • timingSafeEqual to prevent timing attacks
      • Returns false if secret not configured or signature malformed/mismatched
  - lib/paystack/verify.ts — verifyPaystackTransaction(reference):
      • GET https://api.paystack.co/transaction/verify/:reference
      • Returns PaystackTransactionData (status, amount in subunits, customer, metadata)
      • Throws on non-OK response or Paystack status: false
      • Used by admin recheckPaystackPayment action (Phase 8)
  - app/api/webhooks/paystack/route.ts — POST handler:
      • Reads raw body via req.text() (required for HMAC verification)
      • Returns 401 immediately on invalid signature (only non-200 in the handler)
      • Parses JSON; on parse failure: logs 'failed' + returns 200
      • Non-charge.success events: logged as 'ignored' + returns 200
      • charge.success flow:
        1. Fetches contribution by paystack_ref via admin client
        2. If not found: logs 'failed', returns 200
        3. If already 'confirmed': logs 'ignored' (duplicate guard), returns 200
        4. Updates contribution.status → 'confirmed'
        5. If pool_id set: calls increment_pool_raised RPC; falls back to
           read-modify-write if RPC doesn't exist yet (V1 acceptable)
        6. Logs 'processed', returns 200
      • All catch paths: log 'failed' with error_message, return 200
      • logWebhookEvent() helper never throws — swallows its own errors
      • ALL DB writes use createAdminClient() (service role — no RLS)

Next task:    Phase 5 — Support Pools (creator + public)
  - lib/utils/slug.ts — implement generateSlug(title) (still a stub)
  - lib/actions/pool.actions.ts — createPool, closePool, getPoolsByUser
  - components/forms/PoolCreateForm.tsx
  - app/dashboard/pools/page.tsx — pool list with status + progress
  - app/dashboard/pools/[id]/page.tsx — pool detail + contributor list
  - app/[username]/pool/[slug]/page.tsx — public pool page (ContributeForm,
    ProgressBar, ContributionFeedCard, closed banner)
  - Also needed: increment_pool_raised Supabase RPC (SQL migration)
    so the webhook pool update is atomic

Open issues:
  - lib/utils/slug.ts stub still empty — needed before PoolCreateForm
  - increment_pool_raised RPC not yet written as a migration
    (webhook falls back to read-modify-write until it exists)
  - PAYSTACK_WEBHOOK_SECRET is blank in .env.local — must be set before
    testing the webhook end-to-end
  - 001_initial_schema.sql not yet run against the live Supabase project
  - 002_default_tag_trigger.sql not yet run against the live Supabase project
  - gift@kiima.co placeholder email — will need proper gifter email collection
    or Paystack receipt suppression in a later phase
```

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

---

*This document is the contract. When in doubt, refer back here. The spec is the truth.*
