/* ─────────────────────────────────────────────────────────────
   Group 3: Calendar views — replace dots with readable content
   ───────────────────────────────────────────────────────────── */

const CAL_EVENTS = {
  3:  [{ t: "팀 싱크", c: "var(--accent)" }],
  7:  [{ t: "인터뷰", c: "var(--sage)" }, { t: "리뷰", c: "var(--accent-2)" }],
  10: [{ t: "디자인 리뷰", c: "var(--accent)" }],
  14: [{ t: "스프린트 계획", c: "var(--sage)" }],
  15: [{ t: "1:1 · 지민", c: "var(--accent-2)" }],
  18: [{ t: "전체 회의", c: "var(--accent)" }, { t: "리서치", c: "var(--sage)" }, { t: "런치", c: "var(--accent-2)" }],
  22: [{ t: "릴리스 D-1", c: "var(--accent)" }],
  23: [{ t: "릴리스", c: "var(--accent)" }, { t: "회고", c: "var(--sage)" }],
  28: [{ t: "월말 리뷰", c: "var(--accent-2)" }],
};

const TODAY = 22;

/* V1 — Notion baseline: month with dots (the pain point) */
function CalV1_DotsBaseline() {
  const days = Array.from({length: 30}, (_, i) => i + 1);
  const starts = 1; // Apr 1 = Tuesday
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>Calendar</span>}
        right={<><IconBtn kind="filter"/><IconBtn kind="more"/></>}
      />
      <div style={{padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div className="hand" style={{fontSize: 18, fontWeight: 700}}>April 2026</div>
        <div style={{display: "flex", gap: 10}}>
          <span style={{fontFamily: "var(--f-hand)", fontSize: 20}}>‹</span>
          <span style={{fontFamily: "var(--f-hand)", fontSize: 20}}>›</span>
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 8px", borderBottom: "1px solid var(--hairline)"}}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i) => (
          <div key={i} className="hand-label" style={{textAlign: "center", fontSize: 10, color: "var(--ink-3)", padding: "4px 0 8px"}}>{d}</div>
        ))}
      </div>
      <div style={{flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "minmax(60px, 1fr)", padding: "4px 8px"}}>
        {Array(starts).fill(0).map((_,i) => <div key={"e"+i}/>)}
        {days.map(d => (
          <div key={d} style={{border: "1px solid var(--hairline)", padding: 4, textAlign: "center", position: "relative", background: d === TODAY ? "var(--paper-2)" : "transparent"}}>
            <div className="hand" style={{fontSize: 12, color: d===TODAY ? "var(--accent)" : "var(--ink-2)", fontWeight: d===TODAY ? 700 : 400}}>{d}</div>
            <div style={{display: "flex", gap: 2, justifyContent: "center", marginTop: 4, flexWrap: "wrap"}}>
              {(CAL_EVENTS[d] || []).map((e,i) => (
                <span key={i} className="dot" style={{background: e.c, width: 5, height: 5}}/>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{textAlign: "center", padding: 6, fontFamily: "var(--f-label)", fontSize: 10, color: "var(--accent)", borderTop: "1px solid var(--hairline)"}}>점만 보임 · 내용 확인 어려움</div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V2 — Month grid + agenda below (tap a day to see events) */
function CalV2_MonthAgenda() {
  const [sel, setSel] = useState(TODAY);
  const days = Array.from({length: 30}, (_, i) => i + 1);
  const starts = 1;
  const ev = CAL_EVENTS[sel] || [];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>April</span>}
        right={<><IconBtn kind="search"/><IconBtn kind="plus"/></>}
      />
      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "6px 10px 4px"}}>
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} className="hand-label" style={{textAlign: "center", fontSize: 10, color: "var(--ink-3)", padding: "2px 0"}}>{d}</div>
        ))}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 10px 8px", gap: 2}}>
        {Array(starts).fill(0).map((_,i) => <div key={"e"+i}/>)}
        {days.map(d => {
          const has = CAL_EVENTS[d];
          const isSel = sel === d;
          return (
            <div key={d} onClick={() => setSel(d)} style={{
              height: 36, display: "grid", placeItems: "center", position: "relative", cursor: "pointer",
              borderRadius: 3,
              background: isSel ? "var(--ink)" : (d === TODAY ? "var(--paper-2)" : "transparent"),
              color: isSel ? "var(--paper)" : "var(--ink-2)",
            }}>
              <span className="hand" style={{fontSize: 13, fontWeight: d===TODAY ? 700 : 400}}>{d}</span>
              {has && !isSel && <span style={{
                position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                width: 16, height: 2, borderRadius: 1, background: "var(--accent)"
              }}/>}
            </div>
          );
        })}
      </div>

      <div style={{borderTop: "1.3px solid var(--hairline-strong)", padding: "10px 14px 6px", display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
        <div>
          <div className="hand" style={{fontSize: 20, fontWeight: 700, lineHeight: 1}}>April {sel}</div>
          <div className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>Tuesday · {ev.length} events</div>
        </div>
      </div>
      <div className="wf-scroll" style={{padding: "6px 14px 12px"}}>
        {ev.length === 0 && (
          <div className="hand" style={{fontSize: 13, color: "var(--ink-3)", padding: "20px 0", textAlign: "center"}}>일정 없음 — 가볍게 쉬어가는 날</div>
        )}
        {ev.map((e,i) => (
          <div key={i} style={{display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--hairline)"}}>
            <div style={{width: 3, background: e.c, borderRadius: 2}}/>
            <div style={{flex: 1}}>
              <div className="hand" style={{fontSize: 14, fontWeight: 700}}>{e.t}</div>
              <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 2}}>10:00 – 11:00 · 강남 A룸</div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V3 — Week timeline (vertical hours, horizontal days as strip) */
function CalV3_WeekTimeline() {
  const hours = [9, 10, 11, 12, 13, 14, 15];
  const days = [20, 21, 22, 23, 24, 25, 26];
  const labels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const events = [
    { d: 22, h: 10, dur: 1, t: "디자인 리뷰", c: "var(--accent)" },
    { d: 22, h: 14, dur: 1, t: "인터뷰", c: "var(--sage)" },
    { d: 23, h: 11, dur: 2, t: "릴리스", c: "var(--accent)" },
    { d: 24, h: 13, dur: 1, t: "1:1 · 수연", c: "var(--accent-2)" },
  ];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>Week · Apr 20–26</span>}
        right={<IconBtn kind="plus"/>}
      />
      {/* Day strip */}
      <div style={{display: "grid", gridTemplateColumns: "36px repeat(7, 1fr)", borderBottom: "1.3px solid var(--hairline-strong)"}}>
        <div/>
        {days.map((d, i) => {
          const isT = d === TODAY;
          return (
            <div key={d} style={{textAlign: "center", padding: "6px 0 4px", background: isT ? "var(--paper-2)" : "transparent"}}>
              <div className="hand-label" style={{fontSize: 9, color: "var(--ink-3)"}}>{labels[i]}</div>
              <div className="hand" style={{fontSize: 13, fontWeight: isT ? 700 : 400, color: isT ? "var(--accent)" : "var(--ink-2)"}}>{d}</div>
            </div>
          );
        })}
      </div>

      <div className="wf-scroll">
        <div style={{position: "relative", display: "grid", gridTemplateColumns: "36px repeat(7, 1fr)"}}>
          {/* hour column */}
          <div>
            {hours.map(h => (
              <div key={h} className="hand" style={{height: 52, borderBottom: "1px solid var(--hairline)", padding: "2px 4px 0", fontSize: 9, color: "var(--ink-3)"}}>{h}:00</div>
            ))}
          </div>
          {/* day columns */}
          {days.map((d, di) => (
            <div key={d} style={{borderLeft: "1px solid var(--hairline)", position: "relative"}}>
              {hours.map(h => (
                <div key={h} style={{height: 52, borderBottom: "1px solid var(--hairline)"}}/>
              ))}
              {events.filter(e => e.d === d).map((e, ei) => {
                const top = (e.h - hours[0]) * 52 + 2;
                const h = e.dur * 52 - 4;
                return (
                  <div key={ei} style={{
                    position: "absolute", left: 2, right: 2, top, height: h,
                    borderLeft: `2px solid ${e.c}`,
                    background: "var(--paper-2)",
                    padding: "3px 4px",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}>
                    <div className="hand" style={{fontSize: 9, fontWeight: 700, lineHeight: 1.15, color: "var(--ink)"}}>{e.t}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="sk-fab"><span style={{marginTop: -2}}>+</span></div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V4 — List-first: agenda grouped by day */
function CalV4_AgendaList() {
  const sections = [
    { d: 22, label: "Today · Tuesday", events: CAL_EVENTS[22].map(e => ({...e, time: "10:00"})) },
    { d: 23, label: "Tomorrow · Wednesday", events: CAL_EVENTS[23].map((e,i) => ({...e, time: i === 0 ? "09:00" : "16:30"})) },
    { d: 28, label: "Apr 28 · Monday", events: CAL_EVENTS[28].map(e => ({...e, time: "14:00"})) },
  ];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>Upcoming</span>}
        right={<><IconBtn kind="search"/><IconBtn kind="plus"/></>}
      />
      <div style={{display: "flex", gap: 6, padding: "8px 14px", borderBottom: "1.3px solid var(--hairline-strong)"}}>
        {["Agenda","Day","Week","Month"].map((t,i) => (
          <span key={i} className="sk-pill" style={{fontSize: 11, background: i===0 ? "var(--ink)" : "var(--paper)", color: i===0 ? "var(--paper)" : "var(--ink)"}}>{t}</span>
        ))}
      </div>
      <div className="wf-scroll">
        {sections.map((sec,si) => (
          <div key={si}>
            <div style={{padding: "14px 14px 6px", display: "flex", alignItems: "baseline", gap: 10, background: "var(--paper-2)", borderBottom: "1px solid var(--hairline)"}}>
              <div className="hand" style={{fontSize: 22, fontWeight: 700, lineHeight: 1, color: sec.d === TODAY ? "var(--accent)" : "var(--ink)"}}>{sec.d}</div>
              <div className="hand-label" style={{fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-3)"}}>{sec.label.toUpperCase()}</div>
            </div>
            {sec.events.map((e,i) => (
              <div key={i} style={{display: "flex", gap: 12, padding: "12px 14px", borderBottom: "1px solid var(--hairline)"}}>
                <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", width: 40, paddingTop: 2}}>{e.time}</div>
                <div style={{width: 3, background: e.c, borderRadius: 2}}/>
                <div style={{flex: 1}}>
                  <div className="hand" style={{fontSize: 14, fontWeight: 700}}>{e.t}</div>
                  <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 2}}>1시간 · 강남 A룸</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sk-fab"><span style={{marginTop: -2}}>+</span></div>
      <BottomNav active={0}/>
    </Phone>
  );
}

Object.assign(window, { CalV1_DotsBaseline, CalV2_MonthAgenda, CalV3_WeekTimeline, CalV4_AgendaList });
