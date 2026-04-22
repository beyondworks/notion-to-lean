/* ─────────────────────────────────────────────────────────────
   Group 1: Home / Workspace entry screens
   Explores how to surface pages + DBs on a mobile home
   ───────────────────────────────────────────────────────────── */

/* V1 — Notion-like tree as-is (baseline / current-state) */
function HomeV1_TreeBaseline() {
  const items = [
    { d: 0, ch: "▸", n: "📝 회의록", k: "page" },
    { d: 0, ch: "▾", n: "🗂 프로젝트 관리", k: "db" },
    { d: 1, ch: "▸", n: "Q2 로드맵", k: "page" },
    { d: 1, ch: "▸", n: "릴리스 체크리스트", k: "page" },
    { d: 1, ch: "▾", n: "디자인 스프린트", k: "page" },
    { d: 2, ch: "▸", n: "리서치 노트", k: "page" },
    { d: 2, ch: "▸", n: "위클리 싱크", k: "page" },
    { d: 0, ch: "▸", n: "📚 Reading list", k: "db" },
    { d: 0, ch: "▸", n: "🗓 캘린더", k: "db" },
    { d: 0, ch: "▸", n: "🎯 목표", k: "db" },
  ];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="menu"/>}
        title="Private"
        right={<><IconBtn kind="search"/><IconBtn kind="more"/></>}
      />
      <div className="wf-scroll">
        <div style={{padding: "10px 6px"}}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              paddingLeft: 10 + it.d * 18, paddingRight: 12,
              paddingTop: 9, paddingBottom: 9,
              fontFamily: "var(--f-hand)", fontSize: 14, color: "var(--ink-2)"
            }}>
              <span style={{width: 12, color: "var(--ink-3)"}}>{it.ch}</span>
              <span className="hand" style={{fontSize: 14}}>{it.n}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V2 — Card grid with pinned + recent, minimal nesting */
function HomeV2_CardGrid() {
  const pinned = [
    { n: "오늘의 할 일", t: "Today", c: "var(--accent)", k: "DB · 24" },
    { n: "주간 캘린더", t: "Week", c: "var(--sage)", k: "Calendar" },
    { n: "프로젝트", t: "PJ", c: "var(--accent-2)", k: "Board" },
    { n: "회의록", t: "회", c: "var(--ink-2)", k: "24 pages" },
  ];
  const recent = [
    "Q2 로드맵", "디자인 스프린트", "리서치 노트", "위클리 싱크", "릴리스 체크"
  ];
  return (
    <Phone>
      <TopBar
        left={<IconTile ch="A" bg="var(--ink)" color="var(--paper)"/>}
        title={<span className="hand" style={{fontSize: 15}}>My Workspace</span>}
        right={<><IconBtn kind="search"/><IconBtn kind="more"/></>}
      />
      <div className="wf-scroll p-4">
        <div className="hand-label" style={{fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 10}}>PINNED</div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
          {pinned.map((p, i) => (
            <div key={i} className="sk-box" style={{padding: 12, minHeight: 96, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
              <div style={{width: 26, height: 26, borderRadius: 3, background: p.c, opacity: 0.85}}/>
              <div>
                <div className="hand" style={{fontSize: 14, fontWeight: 700}}>{p.n}</div>
                <div className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>{p.k}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="hand-label" style={{fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)", marginTop: 18, marginBottom: 8}}>RECENT</div>
        {recent.map((r, i) => (
          <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--hairline)"}}>
            <IconTile ch="N" bg="var(--paper-2)"/>
            <div className="hand" style={{fontSize: 14, flex: 1}}>{r}</div>
            <span className="sk-icon sk-icon--chevron-r" style={{width: 8, height: 8}}/>
          </div>
        ))}
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V3 — Quick-access dock + horizontal databases shelf */
function HomeV3_DockAndShelf() {
  const dock = [
    { n: "오늘", s: "3" },
    { n: "내일", s: "8" },
    { n: "이번 주", s: "24" },
    { n: "전체", s: "156" },
  ];
  const dbs = [
    { n: "프로젝트", t: "Board", n2: "8 active" },
    { n: "태스크", t: "List",  n2: "24 open" },
    { n: "캘린더", t: "Month", n2: "오늘 3" },
    { n: "회의록", t: "Pages", n2: "24" },
  ];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="menu"/>}
        title={<span className="hand" style={{fontSize: 15}}>Hey, 현우</span>}
        right={<IconBtn kind="plus"/>}
      />
      <div className="wf-scroll">
        {/* Stat dock */}
        <div style={{padding: "14px 14px 6px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8}}>
          {dock.map((d,i) => (
            <div key={i} className="sk-box" style={{padding: "8px 4px", textAlign: "center"}}>
              <div className="hand" style={{fontSize: 22, fontWeight: 700, lineHeight: 1}}>{d.s}</div>
              <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 2}}>{d.n}</div>
            </div>
          ))}
        </div>

        {/* DB shelf — horizontal scroll */}
        <div className="hand-label" style={{fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)", margin: "18px 14px 8px"}}>DATABASES</div>
        <div style={{display: "flex", gap: 10, padding: "0 14px 4px", overflowX: "auto", scrollbarWidth: "none"}}>
          {dbs.map((d, i) => (
            <div key={i} className="sk-box" style={{flex: "0 0 130px", padding: 12}}>
              <div style={{height: 40, background: "var(--paper-2)", borderRadius: 2, marginBottom: 8, border: "1px dashed var(--hairline-strong)", display: "grid", placeItems: "center"}}>
                <span className="hand" style={{fontSize: 10, color: "var(--ink-3)"}}>{d.t}</span>
              </div>
              <div className="hand" style={{fontSize: 13, fontWeight: 700}}>{d.n}</div>
              <div className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>{d.n2}</div>
            </div>
          ))}
          <div style={{flex: "0 0 16px"}}/>
        </div>

        {/* Today preview */}
        <div className="hand-label" style={{fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)", margin: "18px 14px 8px"}}>TODAY</div>
        {[
          { t: "디자인 리뷰", c: "var(--accent)" },
          { t: "스탠드업", c: "var(--sage)" },
          { t: "고객 인터뷰 · 2pm", c: "var(--accent-2)" },
        ].map((t, i) => (
          <div key={i} style={{margin: "0 14px 8px", padding: "10px 12px", borderLeft: `3px solid ${t.c}`, background: "var(--paper-2)", borderRadius: "0 3px 3px 0"}}>
            <div className="hand" style={{fontSize: 13}}>{t.t}</div>
          </div>
        ))}
        <div style={{height: 20}}/>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V4 — Command-center: search-first + smart shortcuts */
function HomeV4_CommandCenter() {
  const actions = [
    "+ 오늘의 할 일", "+ 회의록 새로", "+ 캘린더 일정", "+ 아이디어"
  ];
  const smart = [
    { tag: "AI", t: "지난주 미팅 요약 보기" },
    { tag: "PIN", t: "프로젝트 · Q2 로드맵" },
    { tag: "RECENT", t: "릴리스 체크리스트" },
  ];
  return (
    <Phone>
      <div style={{padding: "18px 14px 10px"}}>
        <div className="hand" style={{fontSize: 26, fontWeight: 700, lineHeight: 1.1}}>Good<br/>morning.</div>
        <div className="hand" style={{fontSize: 13, color: "var(--ink-3)", marginTop: 4}}>Tuesday · Apr 22</div>
      </div>
      {/* big search */}
      <div style={{padding: "0 14px 12px"}}>
        <div className="sk-box" style={{display: "flex", alignItems: "center", gap: 10, padding: "12px 14px"}}>
          <span className="sk-icon sk-icon--search"/>
          <span className="hand" style={{fontSize: 14, color: "var(--ink-3)"}}>무엇이든 검색, 명령 ⌘K</span>
        </div>
      </div>

      <div className="wf-scroll">
        {/* Quick actions */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "6px 14px 0"}}>
          {actions.map((a, i) => (
            <div key={i} className="sk-box sk-box--soft" style={{padding: "12px 10px", fontFamily: "var(--f-hand)", fontSize: 13, color: "var(--ink-2)"}}>{a}</div>
          ))}
        </div>

        <div className="hand-label" style={{fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)", margin: "18px 14px 8px"}}>FOR YOU</div>
        {smart.map((s, i) => (
          <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderTop: "1px solid var(--hairline)"}}>
            <span className="sk-tag" style={{fontSize: 10, letterSpacing: "0.06em"}}>{s.tag}</span>
            <div className="hand" style={{fontSize: 13, flex: 1}}>{s.t}</div>
            <span className="sk-icon sk-icon--chevron-r" style={{width: 8, height: 8}}/>
          </div>
        ))}
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

Object.assign(window, { HomeV1_TreeBaseline, HomeV2_CardGrid, HomeV3_DockAndShelf, HomeV4_CommandCenter });
