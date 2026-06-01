# 🎓 데이터베이스 과제 - 모의 수강신청 시스템

- PostgreSQL을 활용한 웹 서비스 개발 프로젝트
- 배포 주소: https://db-sugang-lsh.vercel.app/

## 🛠 Tech Stack

### Framework

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

### Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

### ORM

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Styling

![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Key Features & Database Design

### 1. 트랜잭션 동시성 제어

- **이슈**: 정원이 한정된 과목에 다수의 학생이 동시에 수강신청을 보낼 경우, Lost Update 및 정원 초과 문제가 발생할 수 있음.
- **해결 방안**: 데이터 조회를 단순하게 수행하지 않고, SQL 쿼리를 통해 명시적으로 행 레벨 락을 걸어줌.
- **결과**: 하나의 트랜잭션이 완료될 때까지 다른 동시 요청을 대기 상태로 제어하여, 데이터베이스 단에서 무결성을 보장함.

### 2. 다중 테이블 JOIN을 통한 수강 내역 조회

- 수강신청 매핑 테이블(`enrollments`)을 중심으로 학생 정보(`Users`)와 강좌 정보(`courses`)를 3중 조인(JOIN)하여 내 수강 내역 화면을 구현.
- 불필요한 반복 쿼리를 방지하고 단 한 번의 조인 연산으로 데이터를 인출하여 데이터베이스 조회 성능을 최적화.

---

## 🚀 Getting Started

### 1. 의존성 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

루트 폴더에 .env 파일을 생성하고 Supabase 데이터베이스 연결 주소를 입력

```bash
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/postgres"
```

### 3. 데이터베이스 마이그레이션 및 시드 설정

```bash
# 테이블 생성
npx prisma migrate dev --name init

# 초기 데이터(학생 4명, 과목 3개) 설정
npx prisma db seed
```

### 4. 로컬 개발 서버 실행

```bash
npm run dev
```
