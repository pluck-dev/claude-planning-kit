# Living Spec 명령어

## 개요
Next.js 퍼블리시된 화면 위에 번호 라벨(①②③)이 표시되고, 클릭하면 Vault의 UI 디스크립션이 팝업으로 뜨는 인터랙티브 Living Spec 시스템.

## 명령어
```
/living-spec status          ← 현재 Spec 시스템 상태 확인
/living-spec export          ← Vault SCR.md → spec-data JSON 변환
/living-spec import          ← 스크린샷 캡처 → Vault 임베드
/living-spec check           ← Vault ↔ JSON 정합성 검증
/living-spec label [screenId] ← 특정 화면에 SpecLabel 래핑 코드 제안
```

---

## 실행 규칙

### /living-spec status
1. `src/spec-data/_manifest.json` 읽기
2. 각 화면별 JSON 존재 여부 확인
3. Vault SCR 문서와 JSON 동기화 상태 표시
4. SpecLabel 적용 현황 (grep으로 `<SpecLabel` 검색)

### /living-spec export
`npm run spec:export` 실행과 동일.
1. Vault `02-기획-디자인/화면설계서/*.md` 스캔
2. frontmatter + 테이블 + 서브섹션 파싱
3. `src/spec-data/{screenId}.json` 생성/업데이트
4. `_manifest.json` 업데이트
5. 변경 리포트 출력

### /living-spec import
`npm run spec:import` 실행과 동일.
1. manifest에서 화면-URL 매핑 확인
2. 각 URL 접속 → spec-mode=screenshot 상태로 캡처
3. Vault `_assets/screenshots/{screenId}-labeled.png` 저장
4. SCR 문서 "2.5 퍼블리시된 UI" 섹션에 임베드

### /living-spec check
`npm run spec:check` 실행과 동일.
1. 5가지 정합성 검증:
   - SCR 있으나 JSON 없음 (Critical)
   - JSON 있으나 SCR 없음 (Warning)
   - Vault 수정시간 > JSON 동기화시간 (Warning)
   - manifest에 등록되지 않은 SCR (Info)
   - SpecLabel 미적용 화면 (Info)
2. ANSI 컬러 리포트 출력

### /living-spec label [screenId]
1. `src/spec-data/{screenId}.json` 읽기
2. 해당 화면의 Next.js 페이지 파일 찾기
3. 각 UI 요소에 대해 `<SpecLabel uiId="UI-xxx">` 래핑 코드 제안
4. 사용자 확인 후 적용

---

## 아키텍처

```
src/components/spec/          ← 컴포넌트 라이브러리
  spec-provider.tsx           ← Context + 모드 + 데이터 로딩
  spec-label.tsx              ← ①②③ 번호 라벨 래핑
  spec-tooltip.tsx            ← 클릭 시 디스크립션 팝업
  spec-panel.tsx              ← 우측 사이드 전체 스펙 패널
  spec-toggle.tsx             ← FAB 토글 (Ctrl+Shift+S)
  spec-screenshot.tsx         ← 스크린샷 캡처 모드

src/spec-data/                ← Vault에서 export된 JSON
  _manifest.json              ← 화면 목록 + 경로 매핑
  SCR-001.json                ← 화면별 스펙 데이터

scripts/                      ← CLI 도구
  vault-export.ts             ← SCR.md → JSON
  vault-import.ts             ← 스크린샷 → Vault
  vault-check.ts              ← 정합성 검증
  vault-utils/                ← 공통 유틸리티
```

## 모드
- **normal**: 라벨 완전 숨김 (프로덕션과 동일)
- **spec**: 번호 라벨 표시 + 클릭 팝업 + 사이드 패널
- **screenshot**: 흰 배경 + 라벨만 표시 (캡처용)

키보드: `Ctrl+Shift+S` 로 모드 순환 (normal → spec → screenshot)

---

### /living-spec audit
`node scripts/audit-spec-mapping.js` 실행과 동일.
1. 모든 page.tsx에서 `<SpecLabel uiId="...">` 추출
2. `_manifest.json`에서 URL 경로 → screenId 매핑
3. 각 SCR JSON의 items와 대조
4. 결과 분류:
   - **OK**: 페이지 uiId와 SCR items 완전 일치
   - **MISMATCH**: 일부 uiId가 SCR에 없거나, SCR에만 있는 항목 존재
   - **NO_SCR**: SpecLabel 사용하지만 매니페스트에 SCR 매핑 없음
5. ANSI 컬러 리포트 출력
6. `--json` 플래그로 JSON 출력 가능

### /living-spec doc-export
`node scripts/generate-doc-json.js` 실행과 동일.
1. Vault `03-개발/기능명세서/FNC-*.md` 스캔
2. Vault `03-개발/API명세서/API-*.md` 스캔
3. 각 마크다운의 frontmatter + 섹션(##) 파싱
4. `src/spec-data/docs/{docId}.json` 생성
5. Doc Viewer (관련문서 탭)에서 즉시 사용 가능
