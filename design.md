# MediCare — Design System

A calm, clinical, trustworthy hospital-themed design system. Prioritizes clarity, accessibility, and information density appropriate for medical workflows — without feeling sterile.

---

## 1. Design Philosophy

- **Purpose** — Help patients, doctors, receptionists, and admins manage appointments quickly and confidently.
- **Tone** — Professional, calming, competent. Neither playful nor cold.
- **Principles**
  - **Clarity over cleverness** — status and next actions are always obvious.
  - **Calm palette** — teal/blue evokes healthcare trust without cliché navy corporate feel.
  - **Content-first density** — dashboards balance whitespace with scannable lists and tables.
  - **Role-aware surfaces** — each role sees only what it needs, in the same visual language.

---

## 2. Color System

All colors are defined as HSL semantic tokens in `src/index.css` and consumed via Tailwind classes mapped in `tailwind.config.ts`. **Never hardcode color utilities** (`text-white`, `bg-[#...]`) in components.

### Light Mode (default)

| Token | HSL | Usage |
|---|---|---|
| `--background` | `200 20% 98%` | App background — soft, cool white |
| `--foreground` | `210 40% 11%` | Primary text |
| `--card` | `0 0% 100%` | Card surfaces |
| `--primary` | `187 65% 38%` | Teal — main CTA, active nav, brand |
| `--accent` | `170 55% 42%` | Green-teal — secondary highlights |
| `--muted` | `200 20% 95%` | Subtle backgrounds, chips |
| `--muted-foreground` | `210 12% 50%` | Secondary text, helper copy |
| `--border` | `210 20% 90%` | Dividers, input borders |
| `--destructive` | `0 72% 51%` | Cancel, delete, danger |

### Dark Mode

Deep desaturated navy background (`210 30% 8%`) with brightened teal primary (`187 65% 48%`) so accents pop without vibrating.

### Semantic Status Colors

Every status color has both a base and a foreground variant, plus soft tinted variants used for badges (see `StatusBadge.tsx`).

| Token | Light HSL | Meaning |
|---|---|---|
| `--success` | `152 60% 40%` | Confirmed appointments, active toggles, check-in success |
| `--warning` | `38 92% 50%` | Pending appointments, block-time reason |
| `--info` | `210 80% 52%` | Completed appointments, informational badges |
| `--destructive` | `0 72% 51%` | Cancelled appointments, cancel actions |

### Sidebar Palette

Slightly cooler than the app background (`--sidebar-background: 200 30% 97%`) to create gentle separation. Active nav items use `--sidebar-accent` (soft teal wash).

### Chart Palette (Recharts)

`--chart-1` through `--chart-5` — teal, green-teal, blue, amber, red — used in admin analytics for bar/pie/line charts. Consistent with status colors so charts read semantically.

---

## 3. Typography

### Font Stack

- **Display / Headings** — `Plus Jakarta Sans` (700–800) — geometric, humanist, modern medical-tech feel.
- **Body** — `Plus Jakarta Sans` (400–600) with `Inter` fallback — high x-height, excellent legibility at small sizes.
- Loaded via Google Fonts in `index.css`.

### Scale

| Use | Class | Weight |
|---|---|---|
| Page title (H1) | `text-2xl font-bold` | 700 |
| Card title | `text-base` / `text-lg` `font-bold` | 700 |
| Section label | `text-sm font-medium` | 500 |
| Body | `text-sm` | 400 |
| Helper / meta | `text-xs text-muted-foreground` | 400 |

All headings use `tracking-tight` for a tighter modern feel.

---

## 4. Layout System

### App Shell (`AppLayout.tsx`)

```text
┌─────────────────────────────────────────────┐
│  Sidebar   │  Header (sticky, backdrop-blur)│
│  (role-    ├────────────────────────────────┤
│   aware)   │                                │
│            │        <Outlet />              │
│            │        (page content,          │
│            │         p-4 md:p-6)            │
└─────────────────────────────────────────────┘
```

- **Sidebar** — collapsible via `SidebarTrigger`, mobile-friendly hamburger.
- **Header** — 56px tall, sticky, translucent backdrop blur.
- **Main** — `p-4` on mobile, `p-6` on desktop; content sections spaced `space-y-6`.

### Grid Rhythm

- Stat cards → `grid gap-4 md:grid-cols-3` (or 4)
- Content lists → `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Forms → single column, `max-w-lg`, `space-y-4`

### Radius & Elevation

- Base radius `--radius: 0.625rem` (`rounded-lg` = 10px).
- Elevation is subtle — most surfaces are flat with borders; hover lifts to `shadow-md`.
- No dramatic glass or blur except the sticky header.

---

## 5. Component Patterns

### Status Badges (`StatusBadge.tsx`)

Tinted-outline badges (15% color background + 30% border + solid text). Consistent across every dashboard so a status reads the same everywhere.

| Status | Color |
|---|---|
| scheduled | amber (`warning`) |
| attended | green (`success`) |
| no-show | slate (muted) |
| cancelled | red (`destructive`) |

### Role Badges (Admin > Users)

Same tinted-outline pattern, different hue per role: patient (blue), doctor (green), receptionist (amber), admin (red).

### Cards

- Stat cards — icon top-right, large number, muted helper text below. Clickable cards use `hover:shadow-md transition-shadow cursor-pointer`.
- List rows — `flex items-center justify-between p-3 rounded-lg border` with a circular icon avatar on the left.

### Timeline (Doctor > Daily Schedule)

Vertical timeline with left rail (`absolute left-5 top-0 bottom-0 w-px bg-border`) and circular time-stamp nodes. Each appointment card sits to the right.

### Tables (Admin)

Standard shadcn `Table` with role/status cells rendering badges instead of plain text.

### Forms

- Labels above inputs (`space-y-2` per field).
- Full-width primary submit button with `Loader2` spinner on submit.
- Date + time pickers use native `type="date"` / `type="time"` inputs for reliability across devices.

### Empty & Loading States

- Loading — `Skeleton` blocks matching final layout height.
- Empty — centered muted-foreground text with an inline CTA link (e.g. "No upcoming appointments. Book one now").

### Feedback

- All mutations trigger a toast (`useToast`) with a short title and optional description.
- Destructive confirmations use `text-destructive` ghost buttons rather than modals for lightweight flows.

---

## 6. Iconography

- Library — `lucide-react` exclusively.
- Size — `h-4 w-4` in navigation and inline, `h-5 w-5` inside avatars.
- Icons carry semantic meaning: `Heart` for the brand, `Building2` for departments, `Stethoscope` for doctors, `Bell` for notifications, `Ban` for blocked time, `CalendarPlus` for creation flows.

---

## 7. Motion

Restrained and functional — motion should never delay a clinical action.

- Card hover — `transition-shadow` only.
- Accordion — Radix defaults (`accordion-down/up` keyframes in Tailwind config).
- Toasts — Sonner defaults.
- `framer-motion` is installed for future hero/dashboard reveal animations but currently unused to keep dashboards instant.

---

## 8. Dark Mode

- Toggled via `ThemeToggle` component; class-based (`.dark` on `<html>`).
- Preference persisted in `localStorage("theme")`, falls back to `prefers-color-scheme`.
- All tokens have matching dark variants — no component should need manual dark: overrides.

---

## 9. Responsive Strategy

- Mobile-first Tailwind breakpoints.
- Sidebar collapses to off-canvas sheet on mobile via `SidebarProvider`.
- Cards stack (`grid-cols-1`) below `md`; header user block hides name text below `sm`.
- List rows switch from `flex-row` to `flex-col` on small screens with `gap-2`.

---

## 10. Accessibility

- All interactive elements use shadcn primitives (Radix under the hood) → keyboard nav + ARIA out of the box.
- Color contrast meets WCAG AA in both themes (verified for text on card, muted-foreground on background, status badges).
- Focus rings use `--ring` token (teal) for visibility on both themes.
- Icons paired with text labels in navigation; icon-only buttons have `sr-only` labels where needed.

---

## 11. File Reference

| Concern | File |
|---|---|
| Color tokens | `src/index.css` |
| Tailwind mapping | `tailwind.config.ts` |
| App shell | `src/components/layout/AppLayout.tsx` |
| Sidebar | `src/components/layout/AppSidebar.tsx` |
| Header | `src/components/layout/Header.tsx` |
| Status badge | `src/components/StatusBadge.tsx` |
| Theme toggle | `src/components/ThemeToggle.tsx` |
| Primitives | `src/components/ui/*` (shadcn) |

---

## 12. Do / Don't

**Do**
- Use semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`).
- Reuse `StatusBadge` for any appointment status.
- Keep page headers to a single `<h1>` with a muted subtitle.
- Compose new views from shadcn primitives.

**Don't**
- Hardcode hex or Tailwind color scales (`bg-blue-500`, `text-white`).
- Introduce a new heading font — extend Plus Jakarta Sans weights instead.
- Nest cards inside cards; prefer bordered list rows.
- Use raw modals for simple confirmations; use ghost destructive buttons + toast.