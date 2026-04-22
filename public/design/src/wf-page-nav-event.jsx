/* ─────────────────────────────────────────────────────────────
   Group 4: Page view + Page open/close patterns + Event modal
   ───────────────────────────────────────────────────────────── */

/* V1 — Page view, baseline (Notion-ish blocks) */
function PageV1_Baseline() {
  return (
    <Phone>
      <TopBar
        left={<><IconBtn kind="back"/><span className="hand" style={{fontSize: 11, color: "var(--ink-3)"}}>Projects / Q2</span></>}
        right={<><IconBtn kind="share"/><IconBtn kind="more"/></>}
      />
      <div className="wf-scroll" style={{padding: "14px 18px"}}>
        <div className="hand" style={{fontSize: 26, fontWeight: 700, lineHeight: 1.15}}>Q2 로드맵</div>
        <div style={{display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap"}}>
          <span className="sk-tag sk-tag--accent">In Progress</span>
          <span className="sk-tag">Owner · 현우</span>
          <span className="sk-tag">Due · Apr 30</span>
        </div>
        <hr className="sk-line" style={{margin: "16px 0"}}/>
        <div className="wf-body">2026년 2분기 제품 전략. 모바일 UX 개선과 데이터베이스 성능을 두 축으로.</div>
        <div className="hand" style={{fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 6}}>핵심 과제</div>
        {["모바일 DB 재설계", "캘린더 가독성 개선", "페이지 열고 닫기 플로우", "API 연동 안정화"].map((t,i) => (
          <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "6px 0"}}>
            <span className={"sk-check" + (i<2 ? " sk-check--on" : "")}/>
            <span className="hand" style={{fontSize: 14, textDecoration: i<2 ? "line-through" : "none", color: i<2 ? "var(--ink-3)" : "var(--ink)"}}>{t}</span>
          </div>
        ))}
        <div className="hand" style={{fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 6}}>링크된 DB</div>
        <div className="sk-box" style={{padding: 12}}>
          <div className="hand-label" style={{fontSize: 10, color: "var(--ink-3)"}}>DATABASE · 태스크</div>
          <div className="hand" style={{fontSize: 13, marginTop: 4}}>▸ 디자인 시스템 v2 정비</div>
          <div className="hand" style={{fontSize: 13, marginTop: 2}}>▸ 온보딩 플로우 리서치</div>
          <div className="hand" style={{fontSize: 11, color: "var(--accent)", marginTop: 6}}>전체 보기 →</div>
        </div>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* V2 — Page with collapsible header + sticky mini-breadcrumb */
function PageV2_CollapseHeader() {
  return (
    <Phone>
      <div style={{padding: "10px 14px", borderBottom: "1.3px solid var(--hairline-strong)", display: "flex", alignItems: "center", gap: 8}}>
        <IconBtn kind="back"/>
        <div style={{flex: 1, display: "flex", alignItems: "center", gap: 6, overflow: "hidden"}}>
          <IconTile ch="P" bg="var(--paper-2)"/>
          <div style={{overflow: "hidden"}}>
            <div className="hand-label" style={{fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.06em"}}>PROJECTS · Q2</div>
            <div className="hand" style={{fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>Q2 로드맵</div>
          </div>
        </div>
        <IconBtn kind="more"/>
      </div>
      <div className="wf-scroll">
        {/* Hero summary */}
        <div style={{padding: "16px 18px", background: "var(--paper-2)", borderBottom: "1px solid var(--hairline)"}}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
            <MetaCell k="Status" v={<span className="sk-tag sk-tag--accent">In Progress</span>}/>
            <MetaCell k="Due" v={<span className="hand" style={{fontSize: 13}}>Apr 30</span>}/>
            <MetaCell k="Owner" v={<span className="hand" style={{fontSize: 13}}>현우</span>}/>
            <MetaCell k="Progress" v={<span className="hand" style={{fontSize: 13}}>2 / 4</span>}/>
          </div>
        </div>
        <div style={{padding: "14px 18px"}}>
          <div className="hand" style={{fontSize: 16, fontWeight: 700, marginBottom: 6}}>개요</div>
          <div className="wf-body">제품 전략. 모바일 UX 개선과 DB 성능이 두 축.</div>
          <div className="hand" style={{fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 6}}>태스크</div>
          {["모바일 DB 재설계", "캘린더 개선"].map((t,i) => (
            <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "6px 0"}}>
              <span className="sk-check"/><span className="hand" style={{fontSize: 14}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}
function MetaCell({ k, v }) {
  return (
    <div>
      <div className="hand-label" style={{fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 3}}>{k.toUpperCase()}</div>
      <div>{v}</div>
    </div>
  );
}

/* ─── Page open/close patterns ─── */

/* NavV1 — Stack (cards stack as you drill; swipe-right-edge to go back) */
function NavV1_CardStack() {
  return (
    <Phone>
      {/* stacked layers peeking from top-left */}
      <div style={{position: "absolute", inset: "60px 22px 18px 8px", background: "var(--paper-2)", borderRadius: 12, border: "1.3px solid var(--hairline-strong)", opacity: 0.5}}/>
      <div style={{position: "absolute", inset: "50px 12px 28px 14px", background: "var(--paper-2)", borderRadius: 10, border: "1.3px solid var(--hairline-strong)", opacity: 0.75}}/>
      <div style={{position: "absolute", inset: "40px 4px 38px 20px", background: "var(--paper)", borderRadius: 8, border: "1.5px solid var(--ink)", boxShadow: "-3px 3px 0 rgba(28,24,19,0.08)", overflow: "hidden"}}>
        <div style={{padding: "10px 14px", borderBottom: "1.3px solid var(--hairline-strong)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <span className="hand" style={{fontSize: 12, color: "var(--accent)"}}>‹ Projects</span>
          <IconBtn kind="close"/>
        </div>
        <div style={{padding: 14}}>
          <div className="hand" style={{fontSize: 20, fontWeight: 700}}>디자인 스프린트</div>
          <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 4}}>3 levels deep</div>
          <hr className="sk-line" style={{margin: "14px 0"}}/>
          <div className="wf-body">스와이프 → 뒤로<br/>좌상단 칩 → 부모로</div>
        </div>
      </div>
      {/* floating hint */}
      <div style={{position: "absolute", right: 12, top: 120, fontFamily: "var(--f-label)", fontSize: 11, color: "var(--accent)"}}>
        ▸ 카드가 쌓임
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* NavV2 — Breadcrumb drawer at top (tap to jump anywhere) */
function NavV2_Breadcrumb() {
  const crumbs = ["Workspace", "Projects", "Q2", "디자인 스프린트", "리서치 노트"];
  return (
    <Phone>
      <div style={{padding: "10px 14px", borderBottom: "1.3px solid var(--hairline-strong)", background: "var(--paper-2)"}}>
        <div style={{display: "flex", gap: 4, alignItems: "center", overflowX: "auto", scrollbarWidth: "none"}}>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              <span className="hand" style={{
                fontSize: 11,
                color: i === crumbs.length-1 ? "var(--accent)" : "var(--ink-3)",
                fontWeight: i === crumbs.length-1 ? 700 : 400,
                whiteSpace: "nowrap"
              }}>{c}</span>
              {i < crumbs.length - 1 && <span style={{fontFamily: "var(--f-hand)", fontSize: 12, color: "var(--ink-3)"}}>›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "start"}}>
        <IconBtn kind="close"/>
        <IconBtn kind="more"/>
      </div>
      <div className="wf-scroll" style={{padding: "0 18px 18px"}}>
        <div className="hand" style={{fontSize: 24, fontWeight: 700}}>리서치 노트</div>
        <div className="wf-body" style={{marginTop: 10}}>일반적 뒤로가기가 아니라 <span className="sk-highlight">빵부스러기를 탭</span>해 상위로 점프.</div>
        <div className="hand" style={{fontSize: 13, marginTop: 18, fontWeight: 700}}>장점</div>
        <div className="wf-body">깊은 계층에서도 한 번에 루트로.</div>
      </div>
      <BottomNav active={0}/>
    </Phone>
  );
}

/* NavV3 — Bottom sheet peek (page opens as sheet, pull down to dismiss) */
function NavV3_BottomSheet() {
  return (
    <Phone>
      {/* background — parent list dim */}
      <div style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "var(--paper-2)", opacity: 0.9}}>
        <div style={{padding: "60px 14px 0"}}>
          {["Q2 로드맵", "디자인 스프린트", "릴리스 체크"].map((n,i) => (
            <div key={i} style={{padding: "12px 4px", borderBottom: "1px solid var(--hairline)", opacity: 0.6}}>
              <span className="hand" style={{fontSize: 13}}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, top: 130,
        background: "var(--paper)",
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        borderTop: "1.5px solid var(--ink)",
        boxShadow: "0 -4px 0 rgba(28,24,19,0.06)",
        padding: "10px 0 0",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{width: 48, height: 4, background: "var(--hairline-strong)", borderRadius: 2, margin: "2px auto 10px"}}/>
        <div style={{padding: "0 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--hairline)"}}>
          <span className="hand-label" style={{fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em"}}>PROJECTS · Q2</span>
          <span className="hand" style={{fontSize: 11, color: "var(--accent)"}}>전체보기 ↗</span>
        </div>
        <div style={{flex: 1, padding: "14px 18px", overflowY: "auto"}}>
          <div className="hand" style={{fontSize: 22, fontWeight: 700}}>Q2 로드맵</div>
          <div className="wf-body" style={{marginTop: 8}}>끌어내리면 닫기. 위로 당기면 풀스크린. 부모 리스트가 항상 뒤에 보임.</div>
          <div style={{display: "flex", gap: 8, marginTop: 12}}>
            <span className="sk-tag sk-tag--accent">In Progress</span>
            <span className="sk-tag">Apr 30</span>
          </div>
        </div>
      </div>

      <div style={{position: "absolute", right: 14, top: 150, fontFamily: "var(--f-label)", fontSize: 11, color: "var(--accent)"}}>↓ drag to close</div>
    </Phone>
  );
}

/* ─── Event creation modals ─── */

function EventV1_FullForm() {
  return (
    <Phone>
      <TopBar
        left={<IconBtn kind="close"/>}
        title={<span className="hand" style={{fontSize: 14}}>새 일정</span>}
        right={<span className="hand" style={{fontSize: 13, color: "var(--accent)", fontWeight: 700, padding: "0 6px"}}>저장</span>}
      />
      <div className="wf-scroll" style={{padding: "14px 18px"}}>
        <div className="hand-label" style={{fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em"}}>TITLE</div>
        <div className="hand" style={{fontSize: 18, fontWeight: 700, borderBottom: "1.3px solid var(--ink)", padding: "4px 0 8px"}}>디자인 리뷰 |</div>
        <div style={{height: 18}}/>
        {[
          ["날짜", "Apr 22 · 2026"],
          ["시간", "10:00 – 11:00"],
          ["종일", null],
          ["반복", "없음"],
          ["장소", "강남 A룸"],
          ["알림", "10분 전"],
          ["DB", "태스크 DB"],
          ["태그", null],
        ].map(([k, v], i) => (
          <div key={i} style={{display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--hairline)"}}>
            <span className="hand" style={{fontSize: 13, color: "var(--ink-3)", width: 64}}>{k}</span>
            {k === "종일" ? (
              <div style={{width: 36, height: 20, border: "1.3px solid var(--ink)", borderRadius: 10, position: "relative", marginLeft: "auto", background: "var(--paper-2)"}}>
                <div style={{position: "absolute", width: 14, height: 14, background: "var(--paper)", border: "1.3px solid var(--ink)", borderRadius: 50, top: 1.5, left: 2}}/>
              </div>
            ) : k === "태그" ? (
              <div style={{display: "flex", gap: 6, marginLeft: "auto"}}>
                <span className="sk-tag sk-tag--accent">work</span>
                <span className="sk-tag" style={{fontSize: 11, color: "var(--ink-3)"}}>+ 추가</span>
              </div>
            ) : (
              <span className="hand" style={{fontSize: 13, marginLeft: "auto"}}>{v} ›</span>
            )}
          </div>
        ))}
      </div>
    </Phone>
  );
}

function EventV2_QuickCapture() {
  return (
    <Phone>
      {/* dimmed background */}
      <div style={{position: "absolute", inset: 0, background: "var(--paper-2)", opacity: 0.85}}>
        <div style={{padding: "54px 14px"}}>
          <div className="hand" style={{fontSize: 18, fontWeight: 700, opacity: 0.5}}>April 22</div>
          <div style={{opacity: 0.5, marginTop: 12}}>
            {[1,2].map(i => <div key={i} style={{height: 40, borderBottom: "1px solid var(--hairline)"}}/>)}
          </div>
        </div>
      </div>
      {/* sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "var(--paper)",
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderTop: "1.5px solid var(--ink)",
        padding: "14px 18px 20px"
      }}>
        <div style={{width: 44, height: 4, background: "var(--hairline-strong)", borderRadius: 2, margin: "-4px auto 12px"}}/>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <span className="hand" style={{fontSize: 22, fontWeight: 700, color: "var(--ink-3)"}}>+</span>
          <div className="hand" style={{fontSize: 18, fontWeight: 700, flex: 1, borderBottom: "1.3px solid var(--ink)", paddingBottom: 4}}>디자인 리뷰 <span style={{background: "var(--highlight)", fontSize: 13, padding: "1px 5px", borderRadius: 2, marginLeft: 6}}>내일 10am</span></div>
        </div>
        <div className="hand" style={{fontSize: 11, color: "var(--ink-3)", marginTop: 6}}>자연어 인식 · "내일 10am" → Apr 23, 10:00</div>

        <div style={{display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16}}>
          {["@ 오늘", "@ 내일", "@ 다음주", "⏰ 10분 전", "📍 장소", "🏷 태그"].map((p,i) => (
            <span key={i} className="sk-pill" style={{fontSize: 11}}>{p}</span>
          ))}
        </div>

        <div style={{display: "flex", gap: 10, marginTop: 16}}>
          <button className="sk-btn sk-btn--ghost" style={{flex: 1}}>상세 ↗</button>
          <button className="sk-btn sk-btn--accent" style={{flex: 2}}>저장</button>
        </div>
      </div>

      <div style={{position: "absolute", top: 100, right: 14, fontFamily: "var(--f-label)", fontSize: 11, color: "var(--accent)", maxWidth: 140, textAlign: "right"}}>한 줄 자연어로<br/>3초 입력</div>
    </Phone>
  );
}

Object.assign(window, { PageV1_Baseline, PageV2_CollapseHeader, NavV1_CardStack, NavV2_Breadcrumb, NavV3_BottomSheet, EventV1_FullForm, EventV2_QuickCapture });
