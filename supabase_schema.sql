-- Real Moments — Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com → your project → SQL Editor)

create extension if not exists "uuid-ossp";

-- Montajes
create table if not exists montajes (
  id uuid primary key default uuid_generate_v4(),
  id_montaje text default '',
  cliente text default '',
  telefono text default '',
  fecha text default '',
  hora text default '',
  sector text default '',
  ubicacion text default '',
  categoria text default '',
  subcategoria text default '',
  paquete text default '',
  items_incluidos text default '',
  add_ons text default '',
  precio_total_add_ons numeric default 0,
  tipo_evento text default '',
  concepto text default '',
  cantidad_personas integer default 0,
  precio_paquete numeric default 0,
  precio_montaje_desmontaje numeric default 0,
  informacion_pagos text default '',
  status_pago text default '',
  review_cliente text default '',
  ingreso_total numeric default 0,
  rubros_costos text default '',
  costos_montaje numeric default 0,
  ganancia_neta numeric default 0,
  notas text default '',
  created_at timestamptz default now()
);

-- Packages
create table if not exists packages (
  id uuid primary key default uuid_generate_v4(),
  categoria text default '',
  subcategoria text default '',
  paquete text default '',
  precio numeric default 0,
  items_incluidos text default ''
);

-- Inventory items
create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  categoria text default '',
  item text default '',
  descripcion text default '',
  referencia_coste_unitario numeric default 0,
  observaciones text default ''
);

-- Inventory movements
create table if not exists inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid,
  tipo_movimiento text check (tipo_movimiento in ('Entrada', 'Salida')),
  cantidad integer default 0,
  fecha text default '',
  notas text default ''
);

-- Suppliers
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  proveedor text default '',
  contacto_comercial text default '',
  producto_servicio text default '',
  precio text default '',
  telefono text default '',
  email text default '',
  direccion text default '',
  review text default '',
  notas text default ''
);

-- App settings (single shared row for all users)
create table if not exists app_settings (
  id integer primary key default 1,
  event_types text[] default array[
    'Cumpleaños de adultos','Cumpleaños de niños','Pedida de mano','Aniversario',
    'Alquiler','Cita romántica','Pet''s Moments','Baby session','Navidad','San Valentín date'
  ],
  payment_statuses text[] default array['Completo','Pendiente','Canje'],
  constraint single_row check (id = 1)
);

-- Insert the default settings row
insert into app_settings (id) values (1) on conflict (id) do nothing;

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- All authenticated users (your team) can read and write everything

alter table montajes enable row level security;
alter table packages enable row level security;
alter table inventory_items enable row level security;
alter table inventory_movements enable row level security;
alter table suppliers enable row level security;
alter table app_settings enable row level security;

create policy "team_access" on montajes for all to authenticated using (true) with check (true);
create policy "team_access" on packages for all to authenticated using (true) with check (true);
create policy "team_access" on inventory_items for all to authenticated using (true) with check (true);
create policy "team_access" on inventory_movements for all to authenticated using (true) with check (true);
create policy "team_access" on suppliers for all to authenticated using (true) with check (true);
create policy "team_access" on app_settings for all to authenticated using (true) with check (true);
