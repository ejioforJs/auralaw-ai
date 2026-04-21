# AuraLaw AI

AuraLaw AI is a Next.js application for browser-based document upload, AI-assisted scanning, redaction, and export. The current build accepts supported files, returns findings for PII, clause, and compliance review, and lets the user download redacted output plus a JSON audit log.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Local development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` in your environment for production metadata and crawler assets:

```bash
NEXT_PUBLIC_SITE_URL=https://auralaw.ai
```

## What’s included

- A homepage with a working upload, scan, and export workflow
- Shared header and footer components
- A server-side scan route for uploaded files
- Security and privacy pages
- Generated metadata assets: manifest, robots, sitemap, icons, Open Graph, and Twitter image
- Error and not-found states
