create extension if not exists pgcrypto;
create type public.product_status as enum ('draft','published','archived');
create type public.order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled','returned');
create type public.payment_status as enum ('pending','paid','failed','refunded');
create type public.user_role as enum ('super_admin','admin','manager','support','customer');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.user_roles (user_id uuid references auth.users(id) on delete cascade, role public.user_role not null default 'customer', primary key(user_id,role));
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, image_url text, sort_order int not null default 0, is_visible boolean not null default true, seo_title text, seo_description text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.collections (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text, banner_url text, is_published boolean not null default true, created_at timestamptz default now());
create table public.products (id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null, name text not null, slug text not null unique, short_description text, description text, price numeric(12,2) not null check(price>0), sale_price numeric(12,2) check(sale_price is null or sale_price>0), status public.product_status not null default 'draft', featured boolean not null default false, sku text unique, seo_title text, seo_description text, created_by uuid references auth.users(id), deleted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.collection_products (collection_id uuid references public.collections(id) on delete cascade, product_id uuid references public.products(id) on delete cascade, sort_order int default 0, primary key(collection_id,product_id));
create table public.product_variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, name text not null, sku text unique, price numeric(12,2) not null check(price>0), compare_at_price numeric(12,2), weight text, stock_quantity int not null default 0 check(stock_quantity>=0), attributes jsonb default '{}'::jsonb, created_at timestamptz default now());
create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, url text not null, alt_text text, sort_order int not null default 0, created_at timestamptz default now());
create table public.carts (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, session_id text unique, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.cart_items (id uuid primary key default gen_random_uuid(), cart_id uuid references public.carts(id) on delete cascade, product_id uuid references public.products(id), variant_id uuid references public.product_variants(id), quantity int not null check(quantity>0), unique(cart_id,product_id,variant_id));
create table public.wishlist_items (user_id uuid references auth.users(id) on delete cascade, product_id uuid references public.products(id) on delete cascade, created_at timestamptz default now(), primary key(user_id,product_id));
create table public.coupons (id uuid primary key default gen_random_uuid(), code text not null unique, discount_type text not null check(discount_type in ('percentage','fixed')), amount numeric(12,2) not null check(amount>0), minimum_order numeric(12,2) default 0, starts_at timestamptz, expires_at timestamptz, usage_limit int, usage_count int not null default 0, active boolean not null default true);
create table public.orders (id uuid primary key default gen_random_uuid(), order_number text not null unique, user_id uuid references auth.users(id), customer jsonb not null, status public.order_status not null default 'pending', payment_method text not null, payment_status public.payment_status not null default 'pending', subtotal numeric(12,2) not null, shipping_amount numeric(12,2) not null default 0, discount_amount numeric(12,2) not null default 0, total numeric(12,2) not null, idempotency_key uuid not null unique, tracking_number text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade, product_id uuid references public.products(id), variant_id uuid references public.product_variants(id), product_name text not null, variant_name text, unit_price numeric(12,2) not null, quantity int not null check(quantity>0), total numeric(12,2) not null);
create table public.order_status_history (id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade, status public.order_status not null, changed_by uuid references auth.users(id), note text, created_at timestamptz default now());
create table public.inventory_movements (id uuid primary key default gen_random_uuid(), variant_id uuid references public.product_variants(id), quantity_change int not null, reason text not null, order_id uuid references public.orders(id), created_by uuid references auth.users(id), created_at timestamptz default now());
create table public.payments (id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id), provider text, transaction_id text, amount numeric(12,2), status public.payment_status default 'pending', created_at timestamptz default now());
create table public.shipments (id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id), carrier text, tracking_number text, shipped_at timestamptz, delivered_at timestamptz);
create table public.coupon_redemptions (id uuid primary key default gen_random_uuid(), coupon_id uuid references public.coupons(id), order_id uuid references public.orders(id), user_id uuid references auth.users(id), created_at timestamptz default now());
create table public.reviews (id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete cascade, user_id uuid references auth.users(id), rating int check(rating between 1 and 5), body text, approved boolean not null default false, created_at timestamptz default now(), unique(product_id,user_id));
create table public.banners (id uuid primary key default gen_random_uuid(), title text, body text, image_url text, cta_label text, cta_url text, sort_order int default 0, enabled boolean default true);
create table public.homepage_sections (id uuid primary key default gen_random_uuid(), section_key text unique, content jsonb not null default '{}'::jsonb, sort_order int default 0, visible boolean default true);
create table public.pages (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, body text, seo_title text, seo_description text, published boolean default false);
create table public.blog_posts (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, body text, featured_image_url text, published boolean default false, published_at timestamptz);
create table public.faqs (id uuid primary key default gen_random_uuid(), question text not null, answer text not null, sort_order int default 0, published boolean default true);
create table public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text unique not null, consent_at timestamptz not null default now(), unsubscribed_at timestamptz);
create table public.shipping_rules (id uuid primary key default gen_random_uuid(), name text not null, province text, min_order numeric(12,2) default 0, rate numeric(12,2) not null, active boolean default true);
create table public.site_settings (setting_key text primary key, value jsonb not null, updated_at timestamptz default now());
create table public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id), action text not null, entity_type text, entity_id uuid, before_data jsonb, after_data jsonb, created_at timestamptz default now());
create index products_category_idx on public.products(category_id) where deleted_at is null;
create index products_status_idx on public.products(status) where deleted_at is null;
create index orders_created_idx on public.orders(created_at desc);
create index variants_product_idx on public.product_variants(product_id);

create or replace function public.create_order(p_customer jsonb,p_items jsonb,p_payment_method text,p_idempotency_key uuid,p_user_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_order uuid; v_total numeric:=0; v_item jsonb; v_variant record; v_price numeric; v_number text;
begin
 if exists(select 1 from orders where idempotency_key=p_idempotency_key) then return (select jsonb_build_object('order_number',order_number,'id',id) from orders where idempotency_key=p_idempotency_key); end if;
 for v_item in select * from jsonb_array_elements(p_items) loop
  select pv.*,p.name as product_name into v_variant from product_variants pv join products p on p.id=pv.product_id where pv.id=(v_item->>'variant_id')::uuid and pv.product_id=(v_item->>'product_id')::uuid for update;
  if not found then raise exception 'A selected product variant is unavailable'; end if;
  if v_variant.stock_quantity < (v_item->>'quantity')::int then raise exception 'Insufficient stock for %',v_variant.product_name; end if;
  v_total:=v_total+(v_variant.price*(v_item->>'quantity')::int);
 end loop;
 v_number:='SG-'||to_char(now(),'YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
 insert into orders(order_number,user_id,customer,payment_method,subtotal,total,idempotency_key) values(v_number,p_user_id,p_customer,p_payment_method,v_total,v_total,p_idempotency_key) returning id into v_order;
 for v_item in select * from jsonb_array_elements(p_items) loop
  select pv.*,p.name as product_name into v_variant from product_variants pv join products p on p.id=pv.product_id where pv.id=(v_item->>'variant_id')::uuid for update;
  update product_variants set stock_quantity=stock_quantity-(v_item->>'quantity')::int where id=v_variant.id;
  insert into order_items(order_id,product_id,variant_id,product_name,variant_name,unit_price,quantity,total) values(v_order,v_variant.product_id,v_variant.id,v_variant.product_name,v_variant.name,v_variant.price,(v_item->>'quantity')::int,v_variant.price*(v_item->>'quantity')::int);
  insert into inventory_movements(variant_id,quantity_change,reason,order_id) values(v_variant.id,-(v_item->>'quantity')::int,'order',v_order);
 end loop;
 insert into order_status_history(order_id,status) values(v_order,'pending');
 return jsonb_build_object('id',v_order,'order_number',v_number);
end $$;

alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_variants enable row level security; alter table public.product_images enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.user_roles enable row level security;
create policy "public categories" on public.categories for select using(is_visible=true); create policy "public products" on public.products for select using(status='published' and deleted_at is null); create policy "public variants" on public.product_variants for select using(exists(select 1 from products p where p.id=product_id and p.status='published')); create policy "public images" on public.product_images for select using(exists(select 1 from products p where p.id=product_id and p.status='published')); create policy "users own orders" on public.orders for select using(auth.uid()=user_id);
