-- 새롭고 비어 있는 Supabase/Postgres 프로젝트용 기준 스키마입니다.
-- 실제 DB에서는 실행하지 않았습니다. 이미 public.kpi_records가 있으면
-- 이 파일을 실행하지 말고 schema-existing-migration.sql과 저장구조.md를
-- 검토해 대상 구조에 맞춘 마이그레이션을 별도로 작성하세요.
-- 기존 행/테이블 삭제·덮어쓰기·재생성 구문은 포함하지 않습니다.
--
-- 원본 화면에서 확인한 업무 항목: month(월), team(부서),
-- target(목표 원), actual(실적 원).
-- 연결을 위한 추가 설계: uuid id, auth.users 기반 user_id, created_at,
-- 형식·범위·중복 제약 및 본인 행만 접근하는 RLS 정책.
-- 작업공간 루트 schema.sql에 있던 optional source_id와 사용자별 유일성도 포함.
-- 한 행은 한 사용자의 한 달 한 부서 KPI를 뜻합니다.
-- 목표와 실적은 원 단위 안전한 정수(0..9007199254740991)입니다.

begin;

create table public.kpi_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  source_id text,
  month text not null
    check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  team text not null
    check (length(btrim(team)) between 1 and 80 and team = btrim(team)),
  target bigint not null
    check (target between 0 and 9007199254740991),
  actual bigint not null
    check (actual between 0 and 9007199254740991),
  created_at timestamptz not null default now(),
  constraint kpi_records_user_month_team_key unique (user_id, month, team),
  constraint kpi_records_user_source_key unique (user_id, source_id)
);

alter table public.kpi_records enable row level security;

revoke all on public.kpi_records from anon;
grant select, insert, update, delete on public.kpi_records to authenticated;

create policy kpi_records_select_own
  on public.kpi_records for select to authenticated
  using ((select auth.uid()) = user_id);

create policy kpi_records_insert_own
  on public.kpi_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy kpi_records_update_own
  on public.kpi_records for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy kpi_records_delete_own
  on public.kpi_records for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
