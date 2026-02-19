---
id: "PROGRESS"
title: "마스터 진행 추적"
type: "progress"
tags: [진행추적]
updated: "2026-02-19"
---

# 마스터 진행 추적

## 전체 진행률

```
전체  [░░░░░░░░░░░░░░░░░░░░]   0% (0/0)
```

> Dataview 플러그인이 설치되면 아래 쿼리가 자동으로 집계됩니다.

---

## 카테고리별 진행 현황

### 공통 (01-공통/)

```dataviewjs
const types = ["prd", "user-story", "persona", "flow", "glossary", "meeting", "changelog"];
const pages = dv.pages('"01-공통"').where(p => types.includes(p.type));
const approved = pages.where(p => p.status === "approved").length;
const total = pages.length;
const pct = total > 0 ? Math.round(approved / total * 100) : 0;
const bar = "█".repeat(Math.round(pct/5)) + "░".repeat(20 - Math.round(pct/5));
dv.paragraph(`공통  [${bar}]  ${pct}% (${approved}/${total})`);
dv.table(
  ["타입", "총 문서 수", "Approved", "진행률"],
  types.map(t => {
    const tp = pages.where(p => p.type === t);
    const ta = tp.where(p => p.status === "approved").length;
    const tt = tp.length;
    const pp = tt > 0 ? Math.round(ta/tt*100) + "%" : "-";
    return [t, tt, ta, pp];
  })
);
```

### 기획/디자인 (02-기획-디자인/)

```dataviewjs
const types = ["service-concept", "ia", "screen-design", "scenario", "state-screen", "design-token"];
const pages = dv.pages('"02-기획-디자인"').where(p => types.includes(p.type));
const approved = pages.where(p => p.status === "approved").length;
const total = pages.length;
const pct = total > 0 ? Math.round(approved / total * 100) : 0;
const bar = "█".repeat(Math.round(pct/5)) + "░".repeat(20 - Math.round(pct/5));
dv.paragraph(`기획/디자인  [${bar}]  ${pct}% (${approved}/${total})`);
dv.table(
  ["타입", "총 문서 수", "Approved", "진행률"],
  types.map(t => {
    const tp = pages.where(p => p.type === t);
    const ta = tp.where(p => p.status === "approved").length;
    const tt = tp.length;
    const pp = tt > 0 ? Math.round(ta/tt*100) + "%" : "-";
    return [t, tt, ta, pp];
  })
);
```

### 개발 (03-개발/)

```dataviewjs
const types = ["functional-spec", "api-spec", "data-definition", "error-code", "permission-matrix", "state-transition"];
const pages = dv.pages('"03-개발"').where(p => types.includes(p.type));
const approved = pages.where(p => p.status === "approved").length;
const total = pages.length;
const pct = total > 0 ? Math.round(approved / total * 100) : 0;
const bar = "█".repeat(Math.round(pct/5)) + "░".repeat(20 - Math.round(pct/5));
dv.paragraph(`개발  [${bar}]  ${pct}% (${approved}/${total})`);
dv.table(
  ["타입", "총 문서 수", "Approved", "진행률"],
  types.map(t => {
    const tp = pages.where(p => p.type === t);
    const ta = tp.where(p => p.status === "approved").length;
    const tt = tp.length;
    const pp = tt > 0 ? Math.round(ta/tt*100) + "%" : "-";
    return [t, tt, ta, pp];
  })
);
```

### QA (04-QA/)

```dataviewjs
const types = ["test-case", "checklist"];
const pages = dv.pages('"04-QA"').where(p => types.includes(p.type));
const approved = pages.where(p => p.status === "approved").length;
const total = pages.length;
const pct = total > 0 ? Math.round(approved / total * 100) : 0;
const bar = "█".repeat(Math.round(pct/5)) + "░".repeat(20 - Math.round(pct/5));
dv.paragraph(`QA  [${bar}]  ${pct}% (${approved}/${total})`);
dv.table(
  ["타입", "총 문서 수", "Approved", "진행률"],
  types.map(t => {
    const tp = pages.where(p => p.type === t);
    const ta = tp.where(p => p.status === "approved").length;
    const tt = tp.length;
    const pp = tt > 0 ? Math.round(ta/tt*100) + "%" : "-";
    return [t, tt, ta, pp];
  })
);
```

---

## 전체 집계

```dataviewjs
const pages = dv.pages().where(p => p.type && p.status);
const total = pages.length;
const byStatus = {
  "draft": pages.where(p => p.status === "draft").length,
  "in-review": pages.where(p => p.status === "in-review").length,
  "approved": pages.where(p => p.status === "approved").length,
  "revision-needed": pages.where(p => p.status === "revision-needed").length,
  "deprecated": pages.where(p => p.status === "deprecated").length,
};
const pct = total > 0 ? Math.round(byStatus["approved"] / total * 100) : 0;
const bar = "█".repeat(Math.round(pct/5)) + "░".repeat(20 - Math.round(pct/5));

dv.paragraph(`**전체 진행률**  [${bar}]  ${pct}% (${byStatus["approved"]}/${total})`);
dv.table(
  ["상태", "문서 수", "비율"],
  Object.entries(byStatus).map(([k, v]) => [k, v, total > 0 ? Math.round(v/total*100) + "%" : "-"])
);
```

---

## 마일스톤

- [ ] Vault 초기 설정 완료
- [ ] 공통 문서 작성 시작
- [ ] PRD 승인
- [ ] IA / 화면흐름도 승인
- [ ] 화면설계서 1차 완료
- [ ] 기능명세서 / API 명세서 작성 완료
- [ ] TC 작성 완료
- [ ] 전체 문서 리뷰 완료
- [ ] v1.0.0 릴리스

---

## 최근 활동

```dataviewjs
dv.table(
  ["문서", "타입", "상태", "수정일"],
  dv.pages()
    .where(p => p.type && p.updated)
    .sort(p => p.updated, "desc")
    .limit(10)
    .map(p => [p.file.link, p.type, p.status, p.updated])
);
```
