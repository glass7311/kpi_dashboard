# KPI 실습앱

월·부서별 목표와 실적을 비교하는 프레임워크 없는 정적 웹앱입니다. 샘플 모드로 작동하며 실제 데이터베이스에는 연결하지 않습니다.

## 파일 역할

- `index.html`: 화면 구조와 상대 경로 자산 연결
- `style.css`: 화면 스타일과 작은 화면 배치
- `app.js`: 입력·필터·계산 표시·근거표 상호작용
- `core.js`: 월·금액 검사, 합계·달성률 계산, 샘플 데이터, 메모리 전용 저장 어댑터
- `data/kpi.json`, `data/kpi.csv`: 가져오기 실습 및 샘플 원본 비교용 사본. 앱은 이 파일들을 `fetch`하지 않습니다.
- `prd.md`: 화면에서 확인한 요구와 이후 제안
- `저장구조.md`: 원본 코드 분석, 필드·제약·RLS, 화면/DB 검증 구분 및 기존 DB 확인 절차
- `schema.sql`: 새롭고 비어 있는 Supabase/Postgres 프로젝트용 기준 SQL. `source_id`는 선택 필드이며 사용자별 중복을 막습니다. 실행되지 않았습니다.
- `schema-existing-migration.sql`: 기존 DB 확인용 SQL 템플릿. 모든 SQL이 주석 처리되어 있으며 실행 가능한 마이그레이션이 아닙니다.
- `config.example.js`: 공개 프로젝트 주소와 publishable key의 자리표시자
- `config.js`: 로컬 연결 준비용 자리표시자. 현재 앱은 이 파일을 불러오거나 사용하지 않습니다.
- `검증체크리스트.md`: 화면에서 확인한 항목과 DB 연결 후 확인할 항목

## 실행

`index.html`을 브라우저에서 열면 됩니다. 샘플은 `core.js`에서 읽기 때문에 파일을 직접 열어도 JSON/CSV `fetch` 요청이 발생하지 않습니다. 로컬 웹 서버를 쓰려면 이 폴더에서 `python -m http.server 8000`을 실행한 다음 `http://localhost:8000/`을 엽니다.

## 샘플과 DB의 차이

현재 입력·수정·삭제는 메모리 샘플에만 적용됩니다. 새로고침하면 초기 샘플로 돌아오며 로그인이나 DB 저장은 없습니다. JSON과 CSV는 앱의 저장 원본이 아니라 별도 사본입니다. Supabase 어댑터, 인증, 실제 저장은 이후 단계에서 구현해야 합니다.

## GitHub에 올릴 파일

정적 데모를 공유한다면 `index.html`, `style.css`, `app.js`, `core.js`, `data/kpi.json`, `data/kpi.csv`, `README.md`, `prd.md`, `저장구조.md`, `검증체크리스트.md`, `schema.sql`, `schema-existing-migration.sql`, `config.example.js`를 올릴 수 있습니다. `schema.sql`은 새 빈 DB 기준이고, 기존 DB에 바로 실행하면 안 됩니다. 작업공간 루트의 `../schema.sql`은 기존 설계 파일로 보존했습니다. `schema-existing-migration.sql`은 주석뿐인 검토 템플릿입니다. `config.js`는 로컬 설정으로 취급해 저장소에 올리지 마세요. 현재 config 값은 자리표시자뿐이며 앱이 읽지 않습니다. 실제 설정을 추가하더라도 비밀번호, secret key, service_role key는 브라우저 파일이나 공개 저장소에 넣지 마세요.

## 실행 범위

브라우저에서 앱을 열어 기본 샘플, 입력, 필터, 계산, 근거표, 빈 결과를 확인했습니다. 작은 화면 실기기 검증과 실제 DB 연결은 하지 않았습니다. SQL은 설계 문서이며 실제 DB에 실행하지 않았습니다.
