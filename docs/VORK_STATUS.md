# About Vork - Separate Project

**Important**: The `vork/` directory is a **separate Next.js 15 application** that runs independently from the main Maalem-app.

## Status

- ✅ **Not in monorepo workspaces** (see root `package.json`)
- ✅ **Independent build & deployment**
- ❓ **Purpose unclear** - needs clarification with team

## Key Differences from Frontend

| Aspect | Frontend (Vite) | Vork (Next.js) |
|--------|-----------------|----------------|
| **Framework** | React 19 + Vite | Next.js 15 |
| **Build Tool** | Vite | Next.js compiler |
| **Deployment** | Vercel (frontend root) | Separate Vercel deployment |
| **API Routes** | `api/` folder | Built into Next.js |
| **Dev Port** | 3000 | 4028 |
| **Install** | `npm install` (root) | `npm install` (vork dir) |

## Running Vork Locally

```bash
cd vork
npm install
npm run dev
```

Runs on **http://localhost:4028**

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start next dev server
npm run lint       # ESLint
npm run lint:fix   # ESLint with fixes
npm run format     # Code formatting (Prettier)
npm run serve      # Start production server
npm run type-check # TypeScript checking
```

## Structure

```
vork/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── home/               # Home route
│   │       └── page.tsx
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   └── ...
│   └── styles/                 # CSS (Tailwind)
│
├── public/                     # Static assets
│   └── assets/images/          # Images
│
├── tsconfig.json              # TypeScript config
├── next.config.mjs            # Next.js config
├── tailwind.config.js         # Tailwind config
└── package.json
```

## What Should Vork Be?

Possible purposes (clarify with team):
1. **Admin Dashboard** - Manage artisans, orders, disputes
2. **Business Intelligence** - Analytics and reporting
3. **Experimental Feature** - Testing new functionality
4. **Legacy Project** - No longer maintained (consider archiving)

## Recommendation

Once purpose is clarified:

- **If Active**: Document its role clearly and maintain it
- **If Legacy**: Archive in separate repository or mark as deprecated
- **If Admin**: Ensure proper authentication & access control

## Environment Variables

Currently uses same template as frontend. May need separate configuration.

## Deployment

Deploy separately to Vercel:
1. Create new Vercel project
2. Set root directory to `vork/`
3. Configure environment variables
4. Deploy

## Related Files

- **Monorepo Setup**: Root `package.json`
- **Setup Guide**: [docs/SETUP.md](../SETUP.md#vork-separation)
- **Architecture**: [docs/ARCHITECTURE.md](../ARCHITECTURE.md)

---

**Status**: Requires clarification on purpose and long-term plans
