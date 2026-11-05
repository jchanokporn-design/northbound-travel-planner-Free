# Northbound Travel Planner — Version 2

Next.js 15 + React 19 + Tailwind CSS 4. The existing cream / forest-green / terracotta palette and Kanit + DM Sans + Playfair Display typography are retained.

## Version 2 updates
- Daily itinerary opens as a dedicated reading view with a back-to-trip control and previous/next day navigation.
- Roadmap is a restrained editorial route infographic (not cartoon artwork), with selectable Day 1–11 stops.
- Day cards and daily detail hero use keyless Wikimedia Commons photo lookup, with Unsplash fallback images. Wikimedia attribution/license appears when metadata is available.
- Expense detail table includes category, item, payer, status and amount. The estimated trip total is ฿26,741.08.
- Location actions are labelled “แผนที่”; external website/social links are labelled “เว็บ”; each activity has a “ดูเพิ่ม” Google Search link.
- Checklist is grouped into the four requested categories.
- Corrected place names: “เขาโมอาย” and “อ่างเก็บน้ำแม่งัด”.

## Requirements
- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm
- VS Code

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

No API key, Google Cloud project, billing setup, or environment variables are required. The Wikimedia Commons public API is used without an API key; image availability and exact matches are not guaranteed. Photo credits/license labels are shown when provided by Commons metadata. Review each original file page for reuse terms.

## Production build
```bash
npm run build
```

## Deploy to GitHub + Vercel
1. Create a GitHub repository.
2. From this folder run:
```bash
git init
git add .
git commit -m "Northbound Travel Planner v2"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/northbound-travel-planner.git
git push -u origin main
```
3. Sign in to Vercel with GitHub, import the repository, keep the detected Next.js defaults, and Deploy.
4. No environment variables are required.

GitHub Free and Vercel Hobby can be used within their current limits and terms. Vercel Hobby is intended for personal, non-commercial projects. Free tiers and third-party availability can change.

## Data
Itinerary content is stored in `src/lib/itinerary.json`. Expense rows are presented in `src/components/trip-site.tsx` based on the workbook's visible payer and amount entries plus the estimate categories in the worksheet. The workbook provides a category-level estimated budget, not a separate transaction ledger for every food/fuel/toll purchase; those rows are explicitly marked Estimate.
