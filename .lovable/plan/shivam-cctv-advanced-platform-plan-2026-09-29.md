# Shivam CCTV advanced platform plan

## User-facing outcome
Upgrade the current project into a premium CCTV sales, quotation, service, inventory, and customer platform while keeping the live website untouched. The public experience will adopt the brief’s catalogue-first structure, and normal content operations will be manageable from the admin workspace.

## Phase 1 — admin foundation and public catalogue
- Rework the admin workspace into a responsive dashboard with persistent navigation and clear sections for Dashboard, Products, Banners, Offers, Combos, Quotes, Leads, Services, Announcements, Visitors, and Settings.
- Consolidate the existing product management into a more complete catalogue workflow: search, category/availability/stock filters, sorting, add/edit, image management, discount and stock indicators, and safe delete/disable actions.
- Upgrade the dashboard with live summary cards for products, stock, quote requests, service requests, leads, offers, and visitors, plus lightweight charts based on existing data.
- Preserve and surface the existing banner, offer, combo, announcement, enquiry, quotation-request, service-booking, and visitor tools rather than replacing them.
- Refresh the public homepage into a catalogue-first flow using the existing Shivam branding and data: strong service/value introduction, search, category browsing, product cards, product detail, quote request, banners, offers, combos, services, and contact actions.
- Keep the sales flow quote-only: no checkout, payment collection, or Buy Now flow.
- Preserve the approved logo artwork exactly; only use existing app-style containers and current dark black/red/white branding.

## Later phases
- Phase 2: quotation workspace, quotation line items, customer records, printable/downloadable quotations and invoices, status tracking, and quote history.
- Phase 3: service bookings, site surveys, technician assignment, service reports, warranty records, and customer portal views.
- Phase 4: projects/gallery, testimonials, FAQs, richer homepage section controls, business/contact settings, translations, SEO controls, exports/backups, and notification integrations.
- Phase 5: final responsive, accessibility, performance, security, and data-integrity pass across the public and admin experiences.

## Technical details
- Continue using the existing React/Vite structure, design-system components, and Lovable Cloud data layer.
- Use database migrations for any new schema; every new public table will include explicit grants, RLS, and policies in the same migration.
- Reuse existing tables and components wherever possible; add only the minimal tables needed by each later phase.
- Keep roles in the existing separate user_roles table and continue server-validated admin checks.
- Do not modify the published/live domain, generated integration client, auth storage, or existing approved media bytes.
- Validate each phase with the preview, build diagnostics, and end-to-end quote/admin flows before proceeding.

## Non-goals for Phase 1
- No online payments.
- No direct changes to https://www.shivamcctv.in.
- No deletion or reset of existing products, banners, offers, admin settings, or customer-facing data.
- No fabricated business information, credentials, or external notification keys.
