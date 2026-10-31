-- 검토용 템플릿이며 실행할 수 있는 마이그레이션이 아닙니다.
-- 실제 DB를 확인하지 못했고 기존 행의 user_id 매핑 근거도 없습니다.
-- 아래 SQL은 모두 주석 안에 있으므로 실행되지 않습니다.
-- 기존 데이터를 삭제하거나 임의로 현재 사용자에게 귀속시키지 마세요.
-- 루트 schema.sql의 선택 source_id/사용자별 UNIQUE가 실제 DB에도 있는지는 미확인입니다.
-- 먼저 저장구조.md의 적용 전 검토 단계를 완료한 후 실제 구조에 맞게
-- 별도 버전 관리 마이그레이션을 작성·검토해야 합니다.

/* 읽기 전용 사전 확인 예시 — 대상 테이블/스키마명을 확인한 뒤 사용

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'kpi_records'
order by ordinal_position;

select conname, contype, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.kpi_records'::regclass;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'kpi_records';

select relrowsecurity, relforcerowsecurity
from pg_class where oid = 'public.kpi_records'::regclass;

중복·부적합 값 검사 쿼리는 실제 열 형식과 정리 기준을 확인한 뒤 작성하세요.

수동 마이그레이션 순서 — 실행 코드가 아님
1. 백업과 롤백 계획, 대상 테이블을 확정한다.
2. 기존 자료에서 각 행의 실제 소유자를 신뢰 가능한 계정 매핑으로 결정한다.
   매핑이 없으면 user_id NOT NULL/RLS를 안전하게 적용할 수 없다.
3. 공백 정규화 전후 중복, 유효하지 않은 월, 범위 밖 금액을 조회한다.
   기존 행 삭제 없이 수정·중복 병합을 승인받는다.
4. 검증된 소유자 매핑으로 user_id를 채우고, id/created_at 누락 행을
   결정적으로 보완한다. 모든 행 검증 후에만 NOT NULL/UNIQUE를 추가한다.
5. 기존 GRANT와 모든 RLS 정책을 재검토한다. 넓은 permissive 정책이
   남으면 본인 행 정책만 추가해도 다른 접근이 허용될 수 있다.
6. 승인된 별도 마이그레이션으로 제약·정책을 적용하고 두 사용자 시험을 한다.

*/
