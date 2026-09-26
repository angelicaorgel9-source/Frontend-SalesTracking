# MJ Prints Sales Tracking

React + Vite frontend with a Django REST backend. Customer authentication, products,
orders, tracking, profiles, notifications, and payroll use backend APIs. Some admin
and employee screens still contain demo data.

## Run Locally

Start Django in one terminal:

```powershell
cd backend
python manage.py migrate
python manage.py runserver 8001
```

Create an admin login when needed with `python manage.py createsuperuser`.

In a second terminal, start the frontend:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). The frontend uses
`http://127.0.0.1:8001/api` by default. Set `VITE_API_URL` to override it.

Customer signup, login verification, and Mongo-backed address/notification features
require the MongoDB and SMS environment settings documented in `backend/config/settings.py`.

Admin, employee, and customer portals use their respective login routes. Admin users
manage payroll records; employees see payroll belonging to their own account.

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
