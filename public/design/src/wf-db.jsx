/* ─────────────────────────────────────────────────────────────
   Group 2: Database views — solves horizontal tables on mobile
   ───────────────────────────────────────────────────────────── */

/* Shared dataset */
const DB_ROWS = [
  { n: "디자인 시스템 v2 정비", s: "In Progress", d: "Apr 24", o: "현우", p: "High",   e: 8  },
  { n: "온보딩 플로우 리서치",   s: "Review",      d: "Apr 25", o: "지민", p: "Medium", e: 3  },
  { n: "릴리스 노트 초안",       s: "Todo",        d: "Apr 28", o: "수연", p: "Low",    e: 2  },
  { n: "고객 인터뷰 · 5명",      s: "In Progress", d: "Apr 26", o: "현우", p: "High",   e: 5  },
  { n: "마케팅 배너 교체",        s: "Done",        d: "Apr 21", o: "민호", p: "Low",    e: 1  },
  { n: "Q2 로드맵 확정",         s: "Review",      d: "Apr 30", o: "지민", p: "High",   e: 6  },
];
const STATUS_COLOR = {
  "Todo":        { bg: "#EDE3CE", fg: "#6B5E4F" },
  "In Progress": { bg: "#F0E2BE", fg: "#6B5324" },
  "Review":      { bg: "#D9DECE", fg: "#4F5840" },
  "Done":        { bg: "#EED6C4", fg: "#8F4527" },
};
const PRI_DOT = { High: "var(--accent)", Medium: "var(--accent-2)", Low: "var(--sage)" };

/* V1 — Horizontal table (baseline — the current pain) */
function DbV1_HorizontalTable() {
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>태스크</span>}
        right={<><IconBtn kind="filter"/><IconBtn kind="more"/></>}
      />
      <div className="sk-tabs">
        {["Table","Board","Cal","List","Gallery"].map((t,i) => (
          <div key={i} className={"sk-tab" + (i===0 ? " sk-tab--on" : "")}>{t}</div>
        ))}
      </div>
      <div className="wf-scroll" style={{background: "var(--paper-2)"}}>
        {/* simulate horizontal overflow */}
        <div style={{overflowX: "auto", scrollbarWidth: "none"}}>
          <div style={{minWidth: 680, background: "var(--paper)"}}>
            <div style={{display: "grid", gridTemplateColumns: "180px 110px 90px 80px 80px 70px", gap: 0, borderBottom: "1.3px solid var(--hairline-strong)"}}>
              {["Name","Status","Due","Owner","Priority","Est."].map((h,i) => (
                <div key={i} className="hand-label" style={{padding: "10px 8px", fontSize: 10, letterSpacing: "0.06em", color: "var(--ink-3)", borderRight: i<5?"1px solid var(--hairline)":"none"}}>{h}</div>
              ))}
            </div>
            {DB_ROWS.map((r,i) => (
              <div key={i} style={{display: "grid", gridTemplateColumns: "180px 110px 90px 80px 80px 70px", borderBottom: "1px solid var(--hairline)"}}>
                <div className="hand" style={{padding: "10px 8px", fontSize: 12, borderRight: "1px solid var(--hairline)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{r.n}</div>
                <div style={{padding: "10px 8px", borderRight: "1px solid var(--hairline)"}}>
                  <span className="sk-tag" style={{background: STATUS_COLOR[r.s].bg, color: STATUS_COLOR[r.s].fg, fontSize: 10}}>{r.s}</span>
                </div>
                <div className="hand" style={{padding: "10px 8px", fontSize: 12, borderRight: "1px solid var(--hairline)"}}>{r.d}</div>
                <div className="hand" style={{padding: "10px 8px", fontSize: 12, borderRight: "1px solid var(--hairline)"}}>{r.o}</div>
                <div className="hand" style={{padding: "10px 8px", fontSize: 12, borderRight: "1px solid var(--hairline)"}}><span className="dot" style={{background: PRI_DOT[r.p]}}/> {r.p}</div>
                <div className="hand" style={{padding: "10px 8px", fontSize: 12}}>{r.e}h</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign: "center", padding: "8px 0", fontFamily: "var(--f-label)", fontSize: 10, color: "var(--accent)"}}>◂ 좌우로 스크롤 · 가독성↓ ▸</div>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V2 — Stacked cards: title big, rest below as meta line */
function DbV2_StackedCards() {
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>태스크</span>}
        right={<><IconBtn kind="filter"/><IconBtn kind="more"/></>}
      />
      <div className="sk-tabs">
        {["List","Board","Cal","Gallery"].map((t,i) => (
          <div key={i} className={"sk-tab" + (i===0 ? " sk-tab--on" : "")}>{t}</div>
        ))}
      </div>
      <div className="wf-scroll">
        <div style={{padding: "8px 0"}}>
          {DB_ROWS.map((r, i) => (
            <div key={i} style={{padding: "12px 14px", borderBottom: "1px solid var(--hairline)"}}>
              <div style={{display: "flex", alignItems: "start", gap: 10}}>
                <span className="dot" style={{background: PRI_DOT[r.p], marginTop: 6}}/>
                <div style={{flex: 1}}>
                  <div className="hand" style={{fontSize: 15, fontWeight: 700, lineHeight: 1.25}}>{r.n}</div>
                  <div style={{display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap"}}>
                    <span className="sk-tag" style={{background: STATUS_COLOR[r.s].bg, color: STATUS_COLOR[r.s].fg, fontSize: 10}}>{r.s}</span>
                    <span className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>▸ {r.d}</span>
                    <span className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>· {r.o}</span>
                    <span className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>· {r.e}h</span>
                  </div>
                </div>
                <span className="sk-icon sk-icon--chevron-r" style={{width: 8, height: 8, marginTop: 10}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V3 — Swipeable compact table: fix NAME column, swipe other columns */
function DbV3_SwipeCols() {
  const [col, setCol] = useState(0);
  const cols = [
    { k: "s", h: "Status" },
    { k: "d", h: "Due" },
    { k: "o", h: "Owner" },
    { k: "p", h: "Priority" },
  ];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>태스크</span>}
        right={<><IconBtn kind="filter"/><IconBtn kind="more"/></>}
      />
      <div className="sk-tabs">
        {["Compact","Cards","Board","Cal"].map((t,i) => (
          <div key={i} className={"sk-tab" + (i===0 ? " sk-tab--on" : "")}>{t}</div>
        ))}
      </div>

      {/* column swiper header */}
      <div style={{display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, borderBottom: "1.3px solid var(--hairline-strong)"}}>
        <div className="hand-label" style={{fontSize: 10, color: "var(--ink-3)", flex: 1, letterSpacing: "0.08em"}}>NAME</div>
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <span onClick={() => setCol((col-1+cols.length)%cols.length)} className="sk-icon sk-icon--chevron-l" style={{width: 7, height: 7, cursor: "pointer"}}/>
          <div className="hand-label" style={{fontSize: 11, color: "var(--accent)", minWidth: 64, textAlign: "center", letterSpacing: "0.06em"}}>
            {cols[col].h}
          </div>
          <span onClick={() => setCol((col+1)%cols.length)} className="sk-icon sk-icon--chevron-r" style={{width: 7, height: 7, cursor: "pointer"}}/>
        </div>
      </div>

      <div className="wf-scroll">
        {DB_ROWS.map((r, i) => (
          <div key={i} style={{display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid var(--hairline)", gap: 10}}>
            <div className="hand" style={{fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{r.n}</div>
            <div style={{minWidth: 94, textAlign: "right"}}>
              {cols[col].k === "s" && <span className="sk-tag" style={{background: STATUS_COLOR[r.s].bg, color: STATUS_COLOR[r.s].fg, fontSize: 10}}>{r.s}</span>}
              {cols[col].k === "d" && <span className="hand" style={{fontSize: 12, color: "var(--ink-2)"}}>{r.d}</span>}
              {cols[col].k === "o" && <span className="hand" style={{fontSize: 12, color: "var(--ink-2)"}}>{r.o}</span>}
              {cols[col].k === "p" && <span className="hand" style={{fontSize: 12}}><span className="dot" style={{background: PRI_DOT[r.p]}}/> {r.p}</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding: "6px 14px 8px", textAlign: "center", fontFamily: "var(--f-hand)", fontSize: 11, color: "var(--accent)", borderTop: "1px solid var(--hairline)"}}>
        ← 좌/우 스와이프하여 컬럼 전환 →
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V4 — Grouped by Status, collapsible sections */
function DbV4_GroupedSections() {
  const byStatus = {};
  DB_ROWS.forEach(r => { (byStatus[r.s] = byStatus[r.s] || []).push(r); });
  const order = ["In Progress", "Review", "Todo", "Done"];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>태스크</span>}
        right={<><IconBtn kind="filter"/><IconBtn kind="more"/></>}
      />
      <div style={{display: "flex", gap: 6, padding: "8px 14px", borderBottom: "1.3px solid var(--hairline-strong)", alignItems: "center"}}>
        <span className="sk-pill" style={{fontSize: 10}}>Group: Status</span>
        <span className="sk-pill" style={{fontSize: 10}}>Sort: Due ▴</span>
        <span className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginLeft: "auto"}}>6 · visible</span>
      </div>
      <div className="wf-scroll">
        {order.map(st => byStatus[st] && (
          <div key={st}>
            <div style={{display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 6px", background: "var(--paper-2)", borderBottom: "1px solid var(--hairline)"}}>
              <span className="sk-icon sk-icon--chevron-d" style={{width: 8, height: 8}}/>
              <span className="sk-tag" style={{background: STATUS_COLOR[st].bg, color: STATUS_COLOR[st].fg, fontSize: 10}}>{st}</span>
              <span className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>{byStatus[st].length}</span>
            </div>
            {byStatus[st].map((r,i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "11px 14px 11px 22px", borderBottom: "1px solid var(--hairline)"}}>
                <span className="sk-check"/>
                <div style={{flex: 1}}>
                  <div className="hand" style={{fontSize: 13}}>{r.n}</div>
                  <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 2}}>{r.d} · {r.o}</div>
                </div>
                <span className="dot" style={{background: PRI_DOT[r.p]}}/>
              </div>
            ))}
          </div>
        ))}
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

Object.assign(window, { DbV1_HorizontalTable, DbV2_StackedCards, DbV3_SwipeCols, DbV4_GroupedSections });
