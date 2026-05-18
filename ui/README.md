This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## E2E Tests

End-to-end tests are written with [Playwright](https://playwright.dev/) and live in `e2e/`.

### Running locally

```bash
# Run all tests (starts dev server automatically)
npm run test:e2e

# Run with UI mode
npm run test:e2e -- --ui

# Run specific project
npm run test:e2e -- --project=chromium

# Debug mode
npm run test:e2e -- --debug
```

### Test reports

HTML reports are saved to `playwright-report/`. After a run, open with:

```bash
npx playwright show-report
```

### Adding a new spec

1. Create a POM in `e2e/pages/` if the page doesn't have one yet
2. Use `import { test, expect } from '../fixtures/test'`
3. Use `import { SELECTORS } from '../utils/selectors'` for `data-testid` queries
4. Add API mocks to `e2e/fixtures/api-mocks.ts` if needed
5. Prefer `getByRole` > `getByLabel` > `getByTestId`
