# Vork - Next.js Application

**⚠️ This is a separate Next.js 15 project, not part of the main Maalem-app frontend.**

For information about Vork's purpose and status, see [docs/VORK_STATUS.md](../docs/VORK_STATUS.md).

## About This Project

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Port**: 4028

## Quick Start

```bash
cd vork
npm install
npm run dev
```

Open **http://localhost:4028** in your browser.

## Features

- **Next.js 15**: Latest version with improved performance
- **React 19**: Latest React version
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Main page
│   └── home/           # Home route
│       └── page.tsx
├── components/         # Reusable components
│   ├── ui/            # UI components
│   └── ...
└── styles/            # Global styles (Tailwind)
```

## Available Scripts

```bash
npm run dev         # Start development server (port 4028)
npm run build       # Build for production
npm run start       # Start development server
npm run serve       # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Format code with Prettier
npm run type-check  # TypeScript checking
```

## Styling

This project uses **Tailwind CSS** for styling.

- Utility-first approach
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## Configuration Files

- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting

## Code Style

This project follows consistent code conventions:

- **Quotes**: Single quotes (`'string'`)
- **Semicolons**: Required
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 style (objects/arrays only)

ESLint and Prettier are configured to enforce these rules automatically.

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Create a new Vercel project
2. Set root directory to `vork/`
3. Configure environment variables
4. Deploy

Or push to GitHub and connect to Vercel for automatic deploys.

## Type Safety

This project uses TypeScript with strict mode enabled.

```bash
npm run type-check    # Check types without building
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Dependencies

Critical dependencies are marked in `package.json`:
- Do not remove or modify critical dependencies
- They are required for Next.js functionality

## Related Documentation

- **Maalem-app Frontend**: [../frontend/README.md](../frontend/README.md)
- **Project Status**: [../docs/VORK_STATUS.md](../docs/VORK_STATUS.md)
- **Setup Guide**: [../docs/SETUP.md](../docs/SETUP.md#vork-separation)
- **Architecture**: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

---

⚠️ **Important**: This project runs independently. It is not deployed with the main Maalem-app frontend.

For clarification on its purpose and role, see [docs/VORK_STATUS.md](../docs/VORK_STATUS.md).