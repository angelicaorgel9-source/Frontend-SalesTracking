# MJ Prints - Admin Portal (Front End)

A React + Vite front end for the MJ Prints sales tracking system, admin access only.
This is UI only (no backend) — every screen uses local mock data so you can click through
the whole app: Login, Dashboard, Orders, Inventory, Customers, Analytics, Settings,
User Management (with the "generate credentials" modal), and Payroll.

## Run it in VS Code

1. Open this folder (`mj-prints-admin`) in VS Code.
2. Open a terminal (Terminal → New Terminal) and install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the printed URL (usually `http://localhost:5173`) in your browser.

## Login

The login screen is UI-only. Type anything in Username/Password and click **Login** to
enter the admin portal (there's no real authentication).

## Structure

```
src/
  assets/logo.png          MJ Prints logo
  components/               Sidebar, Topbar, StatCard — shared admin-layout pieces
  layouts/AdminLayout.jsx   Sidebar + topbar shell used by every admin page
  pages/                     One file per screen (Dashboard, Orders, Inventory, ...)
  data/mockData.js          All the sample data shown in the tables/cards
  index.css                 Design tokens (colors) + shared styles
```

## Design tokens

Colors are defined as CSS variables in `src/index.css`:

| Token | Hex | Use |
|---|---|---|
| `--color-primary` | `#00AEEF` | Buttons / active / important UI |
| `--color-secondary` | `#CCF3FB` | Highlights / light cards / selected states |
| `--color-background` | `#FFFFFF` | Main background / cards |
| `--color-text` | `#1A1A1A` | Headings / important information |
| `--color-text-secondary` | `#444444` | Labels / regular text |
| `--color-border` | `#D0D0D0` | Borders / dividers / disabled UI |
