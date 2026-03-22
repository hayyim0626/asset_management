create extension if not exists pgcrypto;

create table if not exists public.stock_symbols (
  symbol text primary key,
  name text not null,
  market text not null default 'US',
  asset_kind text not null check (asset_kind in ('US_STOCK', 'US_ETF')),
  currency text not null default 'USD',
  exchange text,
  provider_symbol text,
  provider_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (currency = 'USD')
);

create table if not exists public.stock_quotes (
  symbol text not null references public.stock_symbols(symbol) on update cascade on delete cascade,
  price numeric not null check (price >= 0),
  currency text not null default 'USD',
  price_krw numeric,
  fx_rate_snapshot numeric,
  fetched_at timestamptz not null,
  stale_at timestamptz,
  provider_name text not null,
  provider_status text not null check (provider_status in ('fresh', 'stale', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (symbol, fetched_at),
  check (currency = 'USD'),
  check (price_krw is null or price_krw >= 0),
  check (fx_rate_snapshot is null or fx_rate_snapshot >= 0)
);

create table if not exists public.portfolio_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in ('stocks', 'cash')),
  asset_sub_type text not null,
  symbol text references public.stock_symbols(symbol) on update cascade,
  event_type text not null check (
    event_type in (
      'BUY',
      'SELL',
      'DIVIDEND',
      'CASH_DEPOSIT',
      'CASH_WITHDRAW',
      'FX_BUY_USD',
      'FX_SELL_USD',
      'STOCK_DEPOSIT',
      'ADJUST_POSITION',
      'ADJUST_COST_BASIS'
    )
  ),
  quantity numeric,
  unit_price numeric,
  total_amount numeric,
  currency text not null,
  event_date date not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  check (quantity is null or quantity >= 0),
  check (unit_price is null or unit_price >= 0),
  check (total_amount is null or total_amount >= 0),
  check ((asset_type = 'stocks' and symbol is not null) or asset_type = 'cash')
);

create table if not exists public.portfolio_positions (
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null references public.stock_symbols(symbol) on update cascade on delete cascade,
  quantity numeric not null default 0 check (quantity >= 0),
  avg_unit_cost_usd numeric not null default 0 check (avg_unit_cost_usd >= 0),
  cost_basis_usd numeric not null default 0 check (cost_basis_usd >= 0),
  last_updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, symbol)
);

create table if not exists public.cash_positions (
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text not null,
  balance numeric not null default 0,
  avg_fx_rate_krw_per_usd numeric,
  cost_basis_krw numeric,
  last_updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, currency),
  check (avg_fx_rate_krw_per_usd is null or avg_fx_rate_krw_per_usd >= 0),
  check (cost_basis_krw is null or cost_basis_krw >= 0)
);

create index if not exists idx_stock_symbols_name on public.stock_symbols using gin (to_tsvector('simple', name));
create index if not exists idx_stock_symbols_symbol on public.stock_symbols(symbol);
create index if not exists idx_stock_quotes_symbol_fetched_at on public.stock_quotes(symbol, fetched_at desc);
create index if not exists idx_portfolio_transactions_user_symbol_date
  on public.portfolio_transactions(user_id, symbol, event_date desc, created_at desc);
create index if not exists idx_portfolio_transactions_user_asset_type
  on public.portfolio_transactions(user_id, asset_type, created_at desc);
create index if not exists idx_portfolio_positions_user on public.portfolio_positions(user_id);
create index if not exists idx_cash_positions_user on public.cash_positions(user_id);

alter table public.portfolio_transactions enable row level security;
alter table public.portfolio_positions enable row level security;
alter table public.cash_positions enable row level security;

drop policy if exists "portfolio_transactions_select_own" on public.portfolio_transactions;
create policy "portfolio_transactions_select_own"
  on public.portfolio_transactions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "portfolio_positions_select_own" on public.portfolio_positions;
create policy "portfolio_positions_select_own"
  on public.portfolio_positions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "cash_positions_select_own" on public.cash_positions;
create policy "cash_positions_select_own"
  on public.cash_positions
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.stock_latest_usd_krw_rate()
returns numeric
language sql
stable
as $$
  select coalesce(
    (
      select exchange_rate
      from public.currency_prices
      where currency_symbol = 'USD'
      order by created_at desc
      limit 1
    ),
    0
  )::numeric;
$$;

create or replace function public.rebuild_portfolio_position(p_user_id uuid, p_symbol text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tx record;
  current_qty numeric := 0;
  current_cost numeric := 0;
  effective_qty numeric := 0;
  effective_total numeric := 0;
  last_event_at timestamptz := timezone('utc', now());
begin
  for tx in
    select *
    from public.portfolio_transactions
    where user_id = p_user_id
      and asset_type = 'stocks'
      and symbol = p_symbol
    order by event_date asc, created_at asc, id asc
  loop
    last_event_at := tx.created_at;

    if tx.event_type = 'BUY' then
      effective_qty := coalesce(tx.quantity, 0);
      effective_total := coalesce(tx.total_amount, coalesce(tx.unit_price, 0) * effective_qty, 0);
      current_qty := current_qty + effective_qty;
      current_cost := current_cost + effective_total;
    elsif tx.event_type = 'SELL' then
      effective_qty := coalesce(tx.quantity, 0);

      if effective_qty > current_qty then
        raise exception 'SELL quantity exceeds current position for symbol %', p_symbol;
      end if;

      if current_qty > 0 then
        current_cost := greatest(current_cost - ((current_cost / current_qty) * effective_qty), 0);
      end if;

      current_qty := greatest(current_qty - effective_qty, 0);

      if current_qty = 0 then
        current_cost := 0;
      end if;
    elsif tx.event_type = 'ADJUST_COST_BASIS' then
      effective_total := coalesce(
        tx.total_amount,
        case
          when current_qty > 0 and tx.unit_price is not null then tx.unit_price * current_qty
          else null
        end,
        current_cost
      );
      current_cost := greatest(coalesce(effective_total, 0), 0);
    elsif tx.event_type = 'ADJUST_POSITION' then
      effective_qty := greatest(coalesce(tx.quantity, current_qty), 0);
      effective_total := coalesce(
        tx.total_amount,
        case
          when tx.unit_price is not null then tx.unit_price * effective_qty
          else null
        end,
        current_cost
      );
      current_qty := effective_qty;
      current_cost := case
        when current_qty = 0 then 0
        else greatest(coalesce(effective_total, 0), 0)
      end;
    end if;
  end loop;

  if current_qty <= 0 then
    delete from public.portfolio_positions
    where user_id = p_user_id
      and symbol = p_symbol;
    return;
  end if;

  insert into public.portfolio_positions (
    user_id,
    symbol,
    quantity,
    avg_unit_cost_usd,
    cost_basis_usd,
    last_updated_at
  )
  values (
    p_user_id,
    p_symbol,
    current_qty,
    case when current_qty > 0 then current_cost / current_qty else 0 end,
    current_cost,
    last_event_at
  )
  on conflict (user_id, symbol)
  do update
  set quantity = excluded.quantity,
      avg_unit_cost_usd = excluded.avg_unit_cost_usd,
      cost_basis_usd = excluded.cost_basis_usd,
      last_updated_at = excluded.last_updated_at;
end;
$$;

create or replace function public.rebuild_cash_position(p_user_id uuid, p_currency text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tx record;
  current_balance numeric := 0;
  current_cost_krw numeric := 0;
  amount_value numeric := 0;
  krw_value numeric := 0;
  last_event_at timestamptz := timezone('utc', now());
begin
  for tx in
    select *
    from public.portfolio_transactions
    where user_id = p_user_id
      and asset_type = 'cash'
      and currency = p_currency
    order by event_date asc, created_at asc, id asc
  loop
    last_event_at := tx.created_at;
    amount_value := coalesce(tx.total_amount, tx.quantity, 0);

    if tx.event_type in ('CASH_DEPOSIT', 'DIVIDEND', 'FX_BUY_USD') then
      current_balance := current_balance + amount_value;

      if tx.event_type = 'FX_BUY_USD' then
        krw_value := coalesce((tx.meta ->> 'krwAmount')::numeric, 0);
        current_cost_krw := current_cost_krw + krw_value;
      end if;
    elsif tx.event_type in ('CASH_WITHDRAW', 'FX_SELL_USD') then
      if amount_value > current_balance then
        raise exception 'Cash withdrawal exceeds current balance for currency %', p_currency;
      end if;

      if tx.event_type = 'FX_SELL_USD' and current_balance > 0 then
        current_cost_krw := greatest(
          current_cost_krw - ((current_cost_krw / current_balance) * amount_value),
          0
        );
      end if;

      current_balance := current_balance - amount_value;

      if current_balance = 0 then
        current_cost_krw := 0;
      end if;
    end if;
  end loop;

  if current_balance = 0 and current_cost_krw = 0 then
    delete from public.cash_positions
    where user_id = p_user_id
      and currency = p_currency;
    return;
  end if;

  insert into public.cash_positions (
    user_id,
    currency,
    balance,
    avg_fx_rate_krw_per_usd,
    cost_basis_krw,
    last_updated_at
  )
  values (
    p_user_id,
    p_currency,
    current_balance,
    case
      when p_currency = 'USD' and current_balance > 0 and current_cost_krw > 0
        then current_cost_krw / current_balance
      else null
    end,
    case
      when current_cost_krw > 0 then current_cost_krw
      else null
    end,
    last_event_at
  )
  on conflict (user_id, currency)
  do update
  set balance = excluded.balance,
      avg_fx_rate_krw_per_usd = excluded.avg_fx_rate_krw_per_usd,
      cost_basis_krw = excluded.cost_basis_krw,
      last_updated_at = excluded.last_updated_at;
end;
$$;

create or replace function public.apply_portfolio_transaction_side_effects()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    if old.asset_type = 'stocks' and old.symbol is not null then
      perform public.rebuild_portfolio_position(old.user_id, old.symbol);
    elsif old.asset_type = 'cash' then
      perform public.rebuild_cash_position(old.user_id, old.currency);
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if new.asset_type = 'stocks' and new.symbol is not null then
      perform public.rebuild_portfolio_position(new.user_id, new.symbol);
    elsif new.asset_type = 'cash' then
      perform public.rebuild_cash_position(new.user_id, new.currency);
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_apply_portfolio_transaction_side_effects on public.portfolio_transactions;
create trigger trg_apply_portfolio_transaction_side_effects
after insert or update or delete on public.portfolio_transactions
for each row
execute function public.apply_portfolio_transaction_side_effects();

create or replace function public.search_stock_symbols(p_query text default '', p_limit integer default 20)
returns table (
  symbol text,
  name text,
  market text,
  asset_kind text,
  currency text,
  exchange text,
  provider_symbol text,
  provider_name text,
  is_active boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with normalized as (
    select upper(trim(coalesce(p_query, ''))) as q
  )
  select
    s.symbol,
    s.name,
    s.market,
    s.asset_kind,
    s.currency,
    s.exchange,
    s.provider_symbol,
    s.provider_name,
    s.is_active
  from public.stock_symbols s
  cross join normalized n
  where s.is_active = true
    and (
      n.q = ''
      or s.symbol ilike n.q || '%'
      or s.name ilike '%' || n.q || '%'
      or coalesce(s.exchange, '') ilike '%' || n.q || '%'
    )
  order by
    case when n.q <> '' and s.symbol = n.q then 0 else 1 end,
    case when n.q <> '' and s.symbol ilike n.q || '%' then 0 else 1 end,
    s.symbol asc
  limit greatest(coalesce(p_limit, 20), 1);
$$;

create or replace function public.create_stock_buy_transaction(
  p_symbol text,
  p_quantity numeric,
  p_unit_price numeric default null,
  p_total_amount numeric default null,
  p_event_date date default current_date,
  p_asset_sub_type text default null,
  p_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_symbol text := upper(trim(coalesce(p_symbol, '')));
  v_asset_sub_type text;
  v_total_amount numeric;
  v_transaction_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if v_symbol = '' then
    raise exception 'symbol is required';
  end if;

  if coalesce(p_quantity, 0) <= 0 then
    raise exception 'quantity must be greater than 0';
  end if;

  select asset_kind
  into v_asset_sub_type
  from public.stock_symbols
  where symbol = v_symbol
    and is_active = true;

  if v_asset_sub_type is null then
    raise exception 'Unknown stock symbol: %', v_symbol;
  end if;

  v_total_amount := coalesce(
    nullif(p_total_amount, 0),
    case when p_unit_price is not null then p_unit_price * p_quantity else null end
  );

  if coalesce(v_total_amount, 0) <= 0 then
    raise exception 'total amount must be greater than 0';
  end if;

  insert into public.portfolio_transactions (
    user_id,
    asset_type,
    asset_sub_type,
    symbol,
    event_type,
    quantity,
    unit_price,
    total_amount,
    currency,
    event_date,
    meta
  )
  values (
    v_user_id,
    'stocks',
    coalesce(p_asset_sub_type, v_asset_sub_type),
    v_symbol,
    'BUY',
    p_quantity,
    case when p_unit_price is not null and p_unit_price > 0 then p_unit_price else v_total_amount / p_quantity end,
    v_total_amount,
    'USD',
    coalesce(p_event_date, current_date),
    coalesce(p_meta, '{}'::jsonb)
  )
  returning id into v_transaction_id;

  return jsonb_build_object(
    'transactionId', v_transaction_id,
    'symbol', v_symbol,
    'eventType', 'BUY'
  );
end;
$$;

create or replace function public.create_stock_sell_transaction(
  p_symbol text,
  p_quantity numeric,
  p_unit_price numeric default null,
  p_total_amount numeric default null,
  p_event_date date default current_date,
  p_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_symbol text := upper(trim(coalesce(p_symbol, '')));
  v_position record;
  v_asset_sub_type text;
  v_reference_price numeric;
  v_total_amount numeric;
  v_transaction_id uuid;
  v_event_date date := coalesce(p_event_date, current_date);
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if v_symbol = '' then
    raise exception 'symbol is required';
  end if;

  if coalesce(p_quantity, 0) <= 0 then
    raise exception 'quantity must be greater than 0';
  end if;

  select pp.*, ss.asset_kind
  into v_position
  from public.portfolio_positions pp
  join public.stock_symbols ss on ss.symbol = pp.symbol
  where pp.user_id = v_user_id
    and pp.symbol = v_symbol;

  if not found then
    raise exception 'No stock position found for symbol: %', v_symbol;
  end if;

  if p_quantity > v_position.quantity then
    raise exception 'Sell quantity exceeds current position for symbol: %', v_symbol;
  end if;

  select sq.price
  into v_reference_price
  from public.stock_quotes sq
  where sq.symbol = v_symbol
  order by sq.fetched_at desc
  limit 1;

  v_total_amount := coalesce(
    nullif(p_total_amount, 0),
    case
      when p_unit_price is not null and p_unit_price > 0 then p_unit_price * p_quantity
      when v_reference_price is not null and v_reference_price > 0 then v_reference_price * p_quantity
      else null
    end
  );

  if coalesce(v_total_amount, 0) <= 0 then
    raise exception 'sell price or total amount is required';
  end if;

  insert into public.portfolio_transactions (
    user_id,
    asset_type,
    asset_sub_type,
    symbol,
    event_type,
    quantity,
    unit_price,
    total_amount,
    currency,
    event_date,
    meta
  )
  values (
    v_user_id,
    'stocks',
    v_position.asset_kind,
    v_symbol,
    'SELL',
    p_quantity,
    coalesce(
      case when p_unit_price is not null and p_unit_price > 0 then p_unit_price end,
      case when v_reference_price is not null and v_reference_price > 0 then v_reference_price end,
      v_total_amount / p_quantity
    ),
    v_total_amount,
    'USD',
    v_event_date,
    coalesce(p_meta, '{}'::jsonb) || jsonb_build_object(
      'labelDay', to_char(v_event_date, 'YYYY-MM-DD'),
      'labelMonth', to_char(v_event_date, 'YYYY-MM'),
      'labelYear', to_char(v_event_date, 'YYYY')
    )
  )
  returning id into v_transaction_id;

  return jsonb_build_object(
    'transactionId', v_transaction_id,
    'symbol', v_symbol,
    'eventType', 'SELL'
  );
end;
$$;

create or replace function public.adjust_stock_cost_basis(
  p_symbol text,
  p_total_cost_basis_usd numeric default null,
  p_avg_unit_cost_usd numeric default null,
  p_event_date date default current_date,
  p_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_symbol text := upper(trim(coalesce(p_symbol, '')));
  v_position record;
  v_total_cost numeric;
  v_transaction_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select pp.*, ss.asset_kind
  into v_position
  from public.portfolio_positions pp
  join public.stock_symbols ss on ss.symbol = pp.symbol
  where pp.user_id = v_user_id
    and pp.symbol = v_symbol;

  if not found then
    raise exception 'No stock position found for symbol: %', v_symbol;
  end if;

  v_total_cost := coalesce(
    nullif(p_total_cost_basis_usd, 0),
    case
      when p_avg_unit_cost_usd is not null and p_avg_unit_cost_usd > 0
        then p_avg_unit_cost_usd * v_position.quantity
      else null
    end
  );

  if coalesce(v_total_cost, 0) <= 0 then
    raise exception 'adjusted cost basis must be greater than 0';
  end if;

  insert into public.portfolio_transactions (
    user_id,
    asset_type,
    asset_sub_type,
    symbol,
    event_type,
    quantity,
    unit_price,
    total_amount,
    currency,
    event_date,
    meta
  )
  values (
    v_user_id,
    'stocks',
    v_position.asset_kind,
    v_symbol,
    'ADJUST_COST_BASIS',
    v_position.quantity,
    v_total_cost / nullif(v_position.quantity, 0),
    v_total_cost,
    'USD',
    coalesce(p_event_date, current_date),
    coalesce(p_meta, '{}'::jsonb)
  )
  returning id into v_transaction_id;

  return jsonb_build_object(
    'transactionId', v_transaction_id,
    'symbol', v_symbol,
    'eventType', 'ADJUST_COST_BASIS'
  );
end;
$$;

create or replace function public.get_stock_portfolio()
returns table (
  symbol text,
  name text,
  asset_sub_type text,
  quantity numeric,
  avg_unit_cost_usd numeric,
  cost_basis_usd numeric,
  current_price_usd numeric,
  current_price_krw numeric,
  market_value_usd numeric,
  market_value_krw numeric,
  profit_loss_usd numeric,
  profit_loss_krw numeric,
  profit_loss_percent numeric,
  quote_status text,
  is_stale boolean,
  last_updated timestamptz,
  last_successful_fetched_at timestamptz,
  exchange text,
  market text
)
language sql
stable
security definer
set search_path = public
as $$
  with latest_quotes as (
    select distinct on (sq.symbol)
      sq.symbol,
      sq.price,
      sq.price_krw,
      sq.fx_rate_snapshot,
      sq.fetched_at,
      sq.stale_at,
      sq.provider_status
    from public.stock_quotes sq
    order by sq.symbol, sq.fetched_at desc
  ),
  last_successful_quotes as (
    select distinct on (sq.symbol)
      sq.symbol,
      sq.fetched_at
    from public.stock_quotes sq
    where sq.provider_status = 'fresh'
    order by sq.symbol, sq.fetched_at desc
  )
  select
    pp.symbol,
    ss.name,
    ss.asset_kind as asset_sub_type,
    pp.quantity,
    pp.avg_unit_cost_usd,
    pp.cost_basis_usd,
    coalesce(lq.price, 0) as current_price_usd,
    coalesce(
      lq.price_krw,
      case
        when lq.price is not null
          then lq.price * coalesce(nullif(lq.fx_rate_snapshot, 0), public.stock_latest_usd_krw_rate(), 0)
        else 0
      end
    ) as current_price_krw,
    pp.quantity * coalesce(lq.price, 0) as market_value_usd,
    pp.quantity * coalesce(
      lq.price_krw,
      case
        when lq.price is not null
          then lq.price * coalesce(nullif(lq.fx_rate_snapshot, 0), public.stock_latest_usd_krw_rate(), 0)
        else 0
      end
    ) as market_value_krw,
    (pp.quantity * coalesce(lq.price, 0)) - pp.cost_basis_usd as profit_loss_usd,
    (pp.quantity * coalesce(
      lq.price_krw,
      case
        when lq.price is not null
          then lq.price * coalesce(nullif(lq.fx_rate_snapshot, 0), public.stock_latest_usd_krw_rate(), 0)
        else 0
      end
    )) - (pp.cost_basis_usd * public.stock_latest_usd_krw_rate()) as profit_loss_krw,
    case
      when pp.cost_basis_usd > 0
        then (((pp.quantity * coalesce(lq.price, 0)) - pp.cost_basis_usd) / pp.cost_basis_usd) * 100
      else 0
    end as profit_loss_percent,
    coalesce(lq.provider_status, 'failed') as quote_status,
    case
      when lq.symbol is null then true
      when lq.provider_status in ('stale', 'failed') then true
      when lq.stale_at is not null and lq.stale_at <= timezone('utc', now()) then true
      when lq.fetched_at < timezone('utc', now()) - interval '15 minutes' then true
      else false
    end as is_stale,
    coalesce(lq.fetched_at, pp.last_updated_at) as last_updated,
    lsq.fetched_at as last_successful_fetched_at,
    ss.exchange,
    ss.market
  from public.portfolio_positions pp
  join public.stock_symbols ss on ss.symbol = pp.symbol
  left join latest_quotes lq on lq.symbol = pp.symbol
  left join last_successful_quotes lsq on lsq.symbol = pp.symbol
  where pp.user_id = auth.uid()
  order by market_value_krw desc nulls last, pp.symbol asc;
$$;

create or replace function public.refresh_stock_quotes_if_stale(
  p_symbols text[] default null,
  p_stale_after_minutes integer default 15
)
returns table (
  symbol text,
  needs_refresh boolean,
  reason text,
  latest_fetched_at timestamptz,
  last_successful_fetched_at timestamptz,
  current_status text
)
language sql
stable
security definer
set search_path = public
as $$
  with requested_symbols as (
    select distinct upper(trim(raw_symbol)) as symbol
    from unnest(
      coalesce(
        p_symbols,
        array(
          select pp.symbol
          from public.portfolio_positions pp
          where pp.user_id = auth.uid()
        )
      )
    ) as raw_symbol
    where nullif(trim(raw_symbol), '') is not null
  ),
  latest_quotes as (
    select distinct on (sq.symbol)
      sq.symbol,
      sq.fetched_at,
      sq.stale_at,
      sq.provider_status
    from public.stock_quotes sq
    join requested_symbols rs on rs.symbol = sq.symbol
    order by sq.symbol, sq.fetched_at desc
  ),
  last_successful_quotes as (
    select distinct on (sq.symbol)
      sq.symbol,
      sq.fetched_at
    from public.stock_quotes sq
    join requested_symbols rs on rs.symbol = sq.symbol
    where sq.provider_status = 'fresh'
    order by sq.symbol, sq.fetched_at desc
  )
  select
    rs.symbol,
    case
      when lq.symbol is null then true
      when lq.provider_status = 'failed' then true
      when lq.stale_at is not null and lq.stale_at <= timezone('utc', now()) then true
      when lq.fetched_at < timezone('utc', now()) - make_interval(mins => greatest(coalesce(p_stale_after_minutes, 15), 1)) then true
      else false
    end as needs_refresh,
    case
      when lq.symbol is null then 'missing_quote'
      when lq.provider_status = 'failed' then 'provider_failed'
      when lq.stale_at is not null and lq.stale_at <= timezone('utc', now()) then 'marked_stale'
      when lq.fetched_at < timezone('utc', now()) - make_interval(mins => greatest(coalesce(p_stale_after_minutes, 15), 1)) then 'expired'
      else 'fresh'
    end as reason,
    lq.fetched_at as latest_fetched_at,
    lsq.fetched_at as last_successful_fetched_at,
    coalesce(lq.provider_status, 'failed') as current_status
  from requested_symbols rs
  left join latest_quotes lq on lq.symbol = rs.symbol
  left join last_successful_quotes lsq on lsq.symbol = rs.symbol
  order by rs.symbol asc;
$$;

grant execute on function public.search_stock_symbols(text, integer) to anon, authenticated;
grant execute on function public.create_stock_buy_transaction(text, numeric, numeric, numeric, date, text, jsonb) to authenticated;
grant execute on function public.create_stock_sell_transaction(text, numeric, numeric, numeric, date, jsonb) to authenticated;
grant execute on function public.adjust_stock_cost_basis(text, numeric, numeric, date, jsonb) to authenticated;
grant execute on function public.get_stock_portfolio() to authenticated;
grant execute on function public.refresh_stock_quotes_if_stale(text[], integer) to authenticated;
