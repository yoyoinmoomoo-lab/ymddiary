# YMD Diary

> Digital diary combining Daily / Weekly / Monthly / Yearly views with tag-based navigation.

---

## 📖 프로젝트 개요

YMD 다이어리는 **아날로그 다이어리의 구조(연/월/주/일)**와

**디지털의 장점(검색, 태그, 필터, 뷰 전환)**을 결합한 새로운 형태의 다이어리 서비스입니다.

- Daily 기록 → 자유롭게 작성, 불릿저널 스타일 지원
- Tag 시스템 → 기록을 재구성하고, 다양한 뷰에서 하이라이트
- Yearly / Monthly / Weekly 뷰 → 기록을 다른 시간 축에서 탐색
- 기록은 단순 저장이 아니라 **데이터로 재활용**됩니다.

---

## 🚀 진행 상태

- [x] 초기 기획 문서 작성 (Notion)
- [x] Git 레포 초기화
- [x] 프로젝트 구조 설정
- [x] PR/Issue 템플릿 추가
- [ ] Daily 기록 기능 세로 슬라이스 (v0.1.0)
- [ ] 태그 시스템 기본 훅 연결
- [ ] Monthly / Weekly / Yearly 뷰 확장

---

## 📂 폴더 구조

```
/src           # 메인 앱 코드
/docs          # 아키텍처/결정 기록(ADR), 스크린샷
/.github       # PR/Issue 템플릿, 워크플로우
CHANGELOG.md
README.md
```

---

## 🔖 버전 관리

- `main`: 항상 실행 가능한 버전만 유지
- `feature/<기능명>`: 기능 단위 브랜치 (예: `feature/daily-parser`)
- 태그: 의미 있는 마일스톤 단위 (예: `v0.1.0`)

### 현재 로드맵
- `v0.1.0`: Daily 기록 기능 (기호 파서, 블록 구조)
- `v0.2.0`: 태그 시스템 + Monthly 기본 뷰
- `v0.3.0`: Weekly/Yearly 뷰 확장
- `v0.4.0`: 검색/필터 기능 강화

---

## 🛠️ 기술 스택

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **ORM**: Prisma
- **배포**: Vercel (Frontend) + Railway (Backend)
- **CI/CD**: GitHub Actions

---

## 🤝 팀 운영 원칙

- **팀 리드**: 제품 방향성 결정, 산출물 검토
- **PM (ChatGPT)**: 기획 문서화, 마일스톤 관리, 이슈 작성
- **개발자 (cursor)**: CTO 수준 파트너, 기술 설계/구현 주도

---

## 📌 다음 액션

- Daily 기록 기능 기호 파서 + 블록 모델 설계
- v0.1.0 태그: Daily 입력 → 저장 → 표시 세로 슬라이스 완성
- 태그 시스템 상세 문서 공유 후 확장

---

## 📜 License

현재는 내부 개발용.

추후 오픈소스 공개 여부에 따라 MIT/Apache2 라이선스 적용 검토.
