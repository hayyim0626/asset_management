alter table public.currency_prices
add column if not exists provider_date date;

update public.currency_prices
set provider_date = (created_at at time zone 'utc')::date
where provider_date is null;

alter table public.currency_prices
alter column provider_date set not null;
