/* ─────────────────────────────────────────────────────────────
   Group 5: API Token connection + Sidebar/Tree + Block editor
   ───────────────────────────────────────────────────────────── */

/* Token connect — landing */
function TokenV1_Landing() {
  return (
    <Phone>
      <div style={{padding: "24px 22px 10px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div className="hand" style={{fontSize: 18, fontWeight: 700}}>notion / <span style={{color: "var(--accent)"}}>m</span></div>
        <IconBtn kind="more"/>
      </div>
      <div className="wf-scroll" style={{padding: "20px 22px"}}>
        <div className="hand" style={{fontSize: 28, fontWeight: 700, lineHeight: 1.15}}>
          모바일에서도<br/>
          <span className="sk-underline">편안한 노션</span>.
        </div>
        <div className="wf-body" style={{marginTop: 14}}>
          Notion API 토큰을 한 번 연결하면, 기존 워크스페이스를 모바일 친화 UI로 바로 열 수 있어요.
        </div>

        <div className="hand-label" style={{fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-3)", marginTop: 26, marginBottom: 10}}>WHAT YOU GET</div>
        {[
          "DB를 카드·보드·리스트로 재구성",
          "캘린더에 내용이 보이는 그리드",
          "한 손 엄지 닿는 네비게이션",
          "오프라인 읽기 + 자동 동기화",
        ].map((t,i) => (
          <div key={i} style={{display: "flex", gap: 10, padding: "8px 0", alignItems: "start"}}>
            <span className="hand" style={{fontSize: 13, color: "var(--accent)", fontWeight: 700, width: 18}}>N°{String(i+1).padStart(2,"0")}</span>
            <span className="hand" style={{fontSize: 13, flex: 1}}>{t}</span>
          </div>
        ))}

        <div style={{marginTop: 26, display: "flex", flexDirection: "column", gap: 10}}>
          <button className="sk-btn sk-btn--accent" style={{padding: "14px"}}>Notion과 연결 →</button>
          <button className="sk-btn sk-btn--ghost" style={{padding: "12px", fontSize: 12}}>토큰 직접 붙여넣기</button>
        </div>
      </div>
    </Phone>
  );
}

/* Token paste */
function TokenV2_Paste() {
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>API 연결</span>}
        right={<span className="hand" style={{fontSize: 13, color: "var(--ink-3)"}}>도움말</span>}
      />
      <div className="wf-scroll" style={{padding: "18px 18px"}}>
        <div className="hand" style={{fontSize: 20, fontWeight: 700}}>Notion Integration Token</div>
        <div className="wf-body" style={{marginTop: 6}}>notion.so/my-integrations 에서 생성한 <span className="sk-highlight">Internal Integration Token</span>을 붙여넣어주세요.</div>

        <div className="hand-label" style={{fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-3)", marginTop: 22, marginBottom: 6}}>INTEGRATION TOKEN</div>
        <div className="sk-box" style={{padding: "12px 14px", fontFamily: "var(--f-mono, monospace)", fontSize: 12, color: "var(--ink-3)"}}>
          secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          <span style={{borderLeft: "1.4px solid var(--accent)", marginLeft: 2, display: "inline-block", height: 14, verticalAlign: "middle"}}/>
        </div>
        <div style={{display: "flex", gap: 6, marginTop: 8}}>
          <span className="sk-pill" style={{fontSize: 10}}>📋 붙여넣기</span>
          <span className="sk-pill" style={{fontSize: 10}}>📷 QR 스캔</span>
        </div>

        <div className="hand-label" style={{fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-3)", marginTop: 22, marginBottom: 6}}>SHARED WORKSPACES</div>
        <div className="wf-body">Integration을 페이지에 공유한 뒤 아래에서 확인해 주세요.</div>

        <div className="sk-box sk-box--soft" style={{padding: 12, marginTop: 10, display: "flex", gap: 10, alignItems: "center"}}>
          <IconTile ch="✓" bg="var(--sage)" color="var(--paper)"/>
          <div style={{flex: 1}}>
            <div className="hand" style={{fontSize: 13, fontWeight: 700}}>workspace 연결됨</div>
            <div className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>12 pages · 4 databases 감지</div>
          </div>
        </div>

        <button className="sk-btn sk-btn--accent" style={{padding: 14, marginTop: 22, width: "100%"}}>연결 완료 · 시작하기</button>
        <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", textAlign: "center", marginTop: 10}}>토큰은 기기 키체인에만 저장되며 서버로 전송되지 않아요.</div>
      </div>
    </Phone>
  );
}

/* Token — DB picker (choose which DBs to mobile-ify) */
function TokenV3_DbPicker() {
  const dbs = [
    { n: "태스크", k: "128 items", on: true,  icon: "T", color: "var(--accent)" },
    { n: "캘린더", k: "56 events", on: true,  icon: "C", color: "var(--sage)" },
    { n: "회의록", k: "24 pages",  on: true,  icon: "M", color: "var(--accent-2)" },
    { n: "Reading list", k: "92 items", on: false, icon: "R", color: "var(--ink-3)" },
    { n: "프로젝트", k: "8 active", on: true,  icon: "P", color: "var(--accent)" },
    { n: "인보이스", k: "14 rows",  on: false, icon: "I", color: "var(--ink-3)" },
  ];
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 14}}>사용할 DB 선택</span>}
        right={<span className="hand" style={{fontSize: 13, color: "var(--accent)", fontWeight: 700}}>다음</span>}
      />
      <div className="wf-scroll">
        <div className="wf-body" style={{padding: "12px 18px 8px"}}>
          모바일에서 자주 여는 DB만 켜두면 홈에 바로 뜨고, 동기화도 빨라요.
        </div>
        {dbs.map((d,i) => (
          <div key={i} style={{display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: "1px solid var(--hairline)"}}>
            <IconTile ch={d.icon} bg={d.color} color="var(--paper)"/>
            <div style={{flex: 1}}>
              <div className="hand" style={{fontSize: 14, fontWeight: 700}}>{d.n}</div>
              <div className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>{d.k}</div>
            </div>
            {/* toggle */}
            <div style={{width: 40, height: 22, border: "1.3px solid var(--ink)", borderRadius: 11, position: "relative", background: d.on ? "var(--ink)" : "var(--paper-2)"}}>
              <div style={{position: "absolute", top: 1.5, width: 16, height: 16, background: "var(--paper)", border: "1.3px solid var(--ink)", borderRadius: 50, left: d.on ? 21 : 2}}/>
            </div>
          </div>
        ))}
        <div style={{padding: 18}}>
          <div className="sk-box sk-box--soft" style={{padding: 12, background: "var(--paper-2)"}}>
            <div className="hand" style={{fontSize: 12, color: "var(--ink-2)"}}>
              <span className="hand" style={{fontWeight: 700}}>팁 · </span>
              나중에 설정에서 언제든 변경할 수 있어요.
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* Sidebar — slide-out tree */
function SideV1_SlideOut() {
  return (
    <Phone>
      {/* dimmed content */}
      <div style={{position: "absolute", inset: 0, background: "var(--paper-2)", opacity: 0.4}}/>
      <div style={{position: "absolute", top: 0, bottom: 0, left: 0, width: "78%", background: "var(--paper)", borderRight: "1.5px solid var(--ink)", boxShadow: "3px 0 0 rgba(28,24,19,0.06)", overflow: "hidden", display: "flex", flexDirection: "column"}}>
        <div style={{padding: "14px 14px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1.3px solid var(--hairline-strong)"}}>
          <IconTile ch="A" bg="var(--ink)" color="var(--paper)"/>
          <div>
            <div className="hand" style={{fontSize: 13, fontWeight: 700}}>현우님 · workspace</div>
            <div className="hand" style={{fontSize: 10, color: "var(--ink-3)"}}>3 databases · 12 pages</div>
          </div>
        </div>
        <div style={{padding: "10px 12px"}}>
          <div className="sk-box" style={{display: "flex", alignItems: "center", gap: 8, padding: "8px 10px"}}>
            <span className="sk-icon sk-icon--search"/>
            <span className="hand" style={{fontSize: 12, color: "var(--ink-3)"}}>검색...</span>
          </div>
        </div>
        <div style={{flex: 1, overflowY: "auto", padding: "0 6px"}}>
          {[
            { d: 0, ch: "▾", n: "즐겨찾기", k: "g" },
            { d: 1, ch: "·", n: "오늘의 할 일", k: "p" },
            { d: 1, ch: "·", n: "Q2 로드맵", k: "p" },
            { d: 0, ch: "▾", n: "DATABASES", k: "g" },
            { d: 1, ch: "▸", n: "태스크", k: "db" },
            { d: 1, ch: "▸", n: "캘린더", k: "db" },
            { d: 1, ch: "▸", n: "회의록", k: "db" },
            { d: 0, ch: "▾", n: "PRIVATE", k: "g" },
            { d: 1, ch: "▸", n: "주간 기록", k: "p" },
            { d: 1, ch: "▸", n: "레퍼런스", k: "p" },
          ].map((it, i) => (
            <div key={i} style={{display: "flex", alignItems: "center", gap: 6, padding: "8px 6px", paddingLeft: 8 + it.d * 14, borderRadius: 3}}>
              <span style={{width: 12, color: "var(--ink-3)", fontSize: 10, fontFamily: "var(--f-hand)"}}>{it.ch}</span>
              {it.k === "g" ? (
                <span className="hand-label" style={{fontSize: 10, letterSpacing: "0.08em", color: "var(--ink-3)"}}>{it.n}</span>
              ) : (
                <span className="hand" style={{fontSize: 13}}>{it.n}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{padding: 12, borderTop: "1px solid var(--hairline)"}}>
          <div className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>⚙ 설정 · 동기화</div>
        </div>
      </div>
      {/* peek of content */}
      <div style={{position: "absolute", top: 14, right: 10, fontFamily: "var(--f-label)", fontSize: 11, color: "var(--accent)"}}>swipe →</div>
    </Phone>
  );
}

/* Block editor */
function BlockEditV1() {
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="back"/>}
        title={<span className="hand" style={{fontSize: 12, color: "var(--ink-3)"}}>편집중...</span>}
        right={<span className="hand" style={{fontSize: 13, color: "var(--accent)", fontWeight: 700}}>완료</span>}
      />
      <div className="wf-scroll" style={{padding: "14px 18px"}}>
        <div className="hand" style={{fontSize: 22, fontWeight: 700}}>회의 · 디자인 리뷰</div>
        <div style={{marginTop: 14}}>
          {[
            { k: "t", v: "스프린트 킥오프" },
            { k: "h", v: "안건" },
            { k: "c", v: "모바일 DB 리디자인 합의", on: true },
            { k: "c", v: "캘린더 내용 노출", on: true },
            { k: "c", v: "API 연동 범위 확정", on: false },
            { k: "t", v: "" },
            { k: "sel", v: "스프린트 킥오프" }, // selected block
          ].map((b, i) => {
            if (b.k === "sel") return null;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "start", gap: 8, padding: "6px 0",
                background: i === 6 ? "var(--paper-2)" : "transparent",
                borderLeft: i === 6 ? "2px solid var(--accent)" : "2px solid transparent",
                paddingLeft: 8,
              }}>
                <span style={{color: "var(--ink-3)", fontFamily: "var(--f-hand)", fontSize: 10, paddingTop: 3}}>⋮⋮</span>
                {b.k === "t" && <span className="hand" style={{fontSize: 14, flex: 1, minHeight: 18}}>{b.v || <span style={{color: "var(--ink-3)"}}>/ 명령어...</span>}</span>}
                {b.k === "h" && <span className="hand" style={{fontSize: 16, fontWeight: 700, flex: 1}}>{b.v}</span>}
                {b.k === "c" && (<>
                  <span className={"sk-check" + (b.on ? " sk-check--on" : "")} style={{marginTop: 2}}/>
                  <span className="hand" style={{fontSize: 14, flex: 1, textDecoration: b.on ? "line-through" : "none", color: b.on ? "var(--ink-3)" : "var(--ink)"}}>{b.v}</span>
                </>)}
              </div>
            );
          })}
        </div>
      </div>
      {/* block toolbar */}
      <div style={{borderTop: "1.3px solid var(--hairline-strong)", background: "var(--paper-2)", padding: "8px 12px", display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none"}}>
        {["+ / 블록", "✓ 할 일", "H1", "H2", "• 리스트", "“ 인용", "</> 코드", "— 구분"].map((t,i) => (
          <span key={i} className="sk-pill" style={{fontSize: 11, whiteSpace: "nowrap"}}>{t}</span>
        ))}
      </div>
      {/* fake keyboard */}
      <div style={{height: 200, background: "var(--paper-2)", borderTop: "1.3px solid var(--ink)", padding: 8, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3}}>
        {Array.from({length: 30}).map((_,i) => (
          <div key={i} style={{background: "var(--paper)", border: "1px solid var(--hairline-strong)", borderRadius: 3, height: 30}}/>
        ))}
      </div>
    </Phone>
  );
}

Object.assign(window, { TokenV1_Landing, TokenV2_Paste, TokenV3_DbPicker, SideV1_SlideOut, BlockEditV1 });
