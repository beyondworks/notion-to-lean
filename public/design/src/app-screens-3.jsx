/* Page view, Event edit sheet, Settings, Sidebar sheet */
const { useState: uS3, useEffect: uE3 } = React;

/* ── Recursive block renderer (supports nested children, tables) ── */
function BlockRenderer({ b, idx, checks, toggleCheck, depth = 0 }) {
  const indent = depth * 20;

  if (b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3") {
    const fs = b.type === "heading_1" ? 22 : b.type === "heading_2" ? 19 : 17;
    return <div style={{margin: "16px 0 8px", fontSize: fs, fontWeight: 700, color: "var(--n-text-strong)", paddingLeft: indent}}>{b.content}</div>;
  }

  if (b.type === "to_do") {
    return (
      <div style={{paddingLeft: indent}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", cursor: "pointer"}}
          onClick={() => toggleCheck(b.id)}>
          <div style={{
            width: 16, height: 16, borderRadius: 3, marginTop: 4,
            border: checks[b.id] ? "none" : "1.5px solid var(--n-border-strong)",
            background: checks[b.id] ? "var(--n-accent)" : "transparent",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>{checks[b.id] && <Icon name="check" size={11} color="var(--n-bg)"/>}</div>
          <div className="t-body" style={{textDecoration: checks[b.id] ? "line-through" : "none", color: checks[b.id] ? "var(--n-text-muted)" : "var(--n-text)"}}>{b.content}</div>
        </div>
        {b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} depth={depth + 1}/>)}
      </div>
    );
  }

  if (b.type === "bulleted_list_item") {
    const bullet = depth === 0 ? "•" : depth === 1 ? "◦" : "▪";
    return (
      <div style={{paddingLeft: indent}}>
        <div style={{display: "flex", gap: 8, padding: "4px 0", alignItems: "flex-start"}}>
          <span style={{color: "var(--n-text-muted)", flexShrink: 0, marginTop: 2}}>{bullet}</span>
          <span className="t-body">{b.content}</span>
        </div>
        {b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} depth={depth + 1}/>)}
      </div>
    );
  }

  if (b.type === "numbered_list_item") {
    return (
      <div style={{paddingLeft: indent}}>
        <div style={{display: "flex", gap: 8, padding: "4px 0", alignItems: "flex-start"}}>
          <span style={{color: "var(--n-text-muted)", flexShrink: 0, marginTop: 2}}>{idx + 1}.</span>
          <span className="t-body">{b.content}</span>
        </div>
        {b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} depth={depth + 1}/>)}
      </div>
    );
  }

  if (b.type === "toggle") {
    return <ToggleBlock b={b} depth={depth} checks={checks} toggleCheck={toggleCheck}/>;
  }

  if (b.type === "quote") {
    return <blockquote style={{margin: "8px 0", padding: "4px 12px", borderLeft: "3px solid var(--n-border-strong)", color: "var(--n-text-muted)", marginLeft: indent}} className="t-body">{b.content}</blockquote>;
  }

  if (b.type === "divider") {
    return <hr style={{border: "none", borderTop: "1px solid var(--n-border)", margin: "16px 0"}}/>;
  }

  if (b.type === "callout") {
    return (
      <div style={{
        background: "var(--n-surface-hover)",
        borderRadius: 8,
        padding: "10px 12px",
        display: "flex",
        gap: 10,
        margin: "8px 0",
        marginLeft: indent,
      }}>
        {b.icon && <span style={{flexShrink: 0}}>{b.icon}</span>}
        <div className="t-body" style={{flex: 1}}>{b.content}</div>
      </div>
    );
  }

  if (b.type === "code") {
    return (
      <pre style={{
        background: "var(--n-surface-hover)",
        borderRadius: 8,
        padding: "10px 12px",
        overflowX: "auto",
        fontFamily: "var(--f-mono)",
        fontSize: 13,
        lineHeight: 1.5,
        margin: "8px 0",
        marginLeft: indent,
      }}><code>{b.content}</code></pre>
    );
  }

  if (b.type === "image" && b.imageUrl) {
    return (
      <figure style={{margin: "12px 0", marginLeft: indent}}>
        <img src={b.imageUrl} alt={b.caption || ""} style={{width: "100%", borderRadius: 8, display: "block"}}/>
        {b.caption && <figcaption className="t-footnote" style={{marginTop: 6, textAlign: "center"}}>{b.caption}</figcaption>}
      </figure>
    );
  }

  if ((b.type === "bookmark" || b.type === "embed" || b.type === "link_preview") && b.url) {
    let host = "";
    try { host = new URL(b.url).hostname.replace(/^www\./, ""); } catch {}
    return (
      <a href={b.url} target="_blank" rel="noreferrer" style={{
        display: "block", margin: "12px 0", marginLeft: indent,
        textDecoration: "none", color: "inherit",
      }}>
        <div style={{
          background: "var(--n-surface)",
          border: "1px solid var(--n-border)",
          borderRadius: 10,
          padding: "12px 14px",
          overflow: "hidden",
        }}>
          <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
            <Icon name="share" size={14} color="var(--n-text-muted)"/>
            <span className="t-caption">{host || b.type}</span>
          </div>
          <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
            {b.url}
          </div>
          {b.caption && <div className="t-footnote" style={{marginTop: 4}}>{b.caption}</div>}
        </div>
      </a>
    );
  }

  if (b.type === "video" && b.videoUrl) {
    return (
      <div style={{margin: "12px 0", marginLeft: indent}}>
        <video src={b.videoUrl} controls style={{width: "100%", borderRadius: 8, display: "block"}}/>
      </div>
    );
  }

  if (b.type === "file" && b.fileUrl) {
    return (
      <a href={b.fileUrl} target="_blank" rel="noreferrer" style={{
        display: "flex", alignItems: "center", gap: 10,
        margin: "8px 0", marginLeft: indent,
        padding: "10px 12px", background: "var(--n-surface-hover)",
        borderRadius: 8, textDecoration: "none", color: "var(--n-text)",
      }}>
        <Icon name="archive" size={16} color="var(--n-text-muted)"/>
        <span className="t-body" style={{flex: 1, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
          {b.fileName || b.content || "파일"}
        </span>
      </a>
    );
  }

  if (b.type === "table" && Array.isArray(b.children)) {
    const rows = b.children;
    return (
      <div style={{margin: "12px 0", marginLeft: indent, overflowX: "auto", borderRadius: 8, border: "1px solid var(--n-border)"}}>
        <table style={{borderCollapse: "collapse", fontSize: 13, minWidth: "100%"}}>
          <tbody>
            {rows.map((row, rIdx) => {
              const cells = row.cells || [];
              const isHeader = b.hasColumnHeader && rIdx === 0;
              return (
                <tr key={row.id || rIdx}>
                  {cells.map((cellText, cIdx) => {
                    const Tag = isHeader || (b.hasRowHeader && cIdx === 0) ? "th" : "td";
                    return (
                      <Tag key={cIdx} style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid var(--n-border)",
                        borderRight: cIdx < cells.length - 1 ? "1px solid var(--n-border)" : "none",
                        textAlign: "left",
                        fontWeight: isHeader || (b.hasRowHeader && cIdx === 0) ? 600 : 400,
                        background: isHeader ? "var(--n-surface-hover)" : "var(--n-surface)",
                        whiteSpace: "nowrap",
                      }}>{cellText}</Tag>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (b.type === "child_database") {
    const entries = b.entries || [];
    return (
      <div style={{margin: "12px 0", marginLeft: indent}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", color: "var(--n-text-muted)"}}>
          <Icon name="database" size={14}/>
          <span className="t-caption">{b.databaseTitle || "하위 데이터베이스"}</span>
          <span className="t-caption" style={{marginLeft: "auto"}}>{entries.length}</span>
        </div>
        {entries.length === 0 ? (
          <div className="t-footnote muted" style={{padding: "8px 4px"}}>항목 없음</div>
        ) : (
          <div style={{background: "var(--n-surface)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--n-border)"}}>
            {entries.map((e, i) => (
              <div key={e.id || i}
                onClick={(ev) => { ev.stopPropagation(); if (e.url) window.open(e.url, "_blank"); }}
                style={{
                  padding: "10px 12px",
                  borderTop: i > 0 ? "0.5px solid var(--n-border)" : "none",
                  cursor: "pointer",
                }}>
                <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{e.title}</div>
                {Object.entries(e.props || {}).length > 0 && (
                  <div style={{display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4}}>
                    {Object.entries(e.props).map(([k, v]) => (
                      <span key={k} className="tag tag-gray" style={{fontSize: 10}}>{String(v).slice(0, 30)}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (b.type === "child_page") {
    return (
      <div style={{
        padding: "10px 14px", marginLeft: indent,
        background: "var(--n-surface-hover)", borderRadius: 10,
        margin: "4px 0", display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{flexShrink: 0}}>📄</span>
        <span className="t-body" style={{fontWeight: 500}}>{b.content || "하위 페이지"}</span>
      </div>
    );
  }

  // paragraph / default
  if (!b.content) return null;
  return <p className="t-body" style={{margin: "8px 0", paddingLeft: indent}}>{b.content}</p>;
}

function ToggleBlock({ b, depth, checks, toggleCheck }) {
  const [open, setOpen] = uS3(false);
  const indent = depth * 20;
  return (
    <div style={{paddingLeft: indent}}>
      <div onClick={() => setOpen(!open)} style={{display: "flex", alignItems: "center", gap: 6, padding: "6px 0", cursor: "pointer"}}>
        <Icon name={open ? "chev-d" : "chev-r"} size={14}/>
        <span className="t-body" style={{fontWeight: 500}}>{b.content}</span>
      </div>
      {open && b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} depth={depth + 1}/>)}
    </div>
  );
}

function statusToColor(s) {
  const l = (s || "").toLowerCase();
  if (l.includes("done") || l.includes("완료")) return "green";
  if (l.includes("progress") || l.includes("진행")) return "blue";
  if (l.includes("review") || l.includes("검토")) return "yellow";
  return "gray";
}
function priorityToColor(p) {
  const l = (p || "").toLowerCase();
  if (l.includes("high") || l.includes("높")) return "red";
  if (l.includes("mid") || l.includes("중")) return "orange";
  return "gray";
}
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function PageScreen({ go, goBack, ctx }) {
  const [collapsed, setCollapsed] = uS3({ props: false });
  const [page, setPage] = uS3(null);
  const [blocks, setBlocks] = uS3([]);
  const [loading, setLoading] = uS3(true);
  const [saving, setSaving] = uS3(false);
  const [checks, setChecks] = uS3({});

  const pageId = ctx?.id;

  const fetchPage = React.useCallback(() => {
    if (!pageId) return;
    Promise.all([
      fetch(`/api/pages/${pageId}`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/pages/${pageId}/blocks`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([pageRes, blocksRes]) => {
      // /api/pages/[id] returns flat shape: {id, title, cover, icon, properties, ...}
      setPage(pageRes || null);
      // /api/pages/[id]/blocks returns {data: [...]} or [...]
      const bs = blocksRes?.data || blocksRes || [];
      setBlocks(Array.isArray(bs) ? bs : []);
      // seed checkbox state from to_do blocks
      const seed = {};
      bs.forEach((b) => { if (b.type === "to_do") seed[b.id] = !!b.checked; });
      setChecks(seed);
      setLoading(false);
    });
  }, [pageId]);
  uE3(() => {
    if (!pageId) { setLoading(false); return; }
    setLoading(true);
    fetchPage();
    const onVis = () => { if (!document.hidden) fetchPage(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", fetchPage);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", fetchPage); };
  }, [pageId, fetchPage]);

  const toggleCheck = async (blockId) => {
    const next = !checks[blockId];
    setChecks({ ...checks, [blockId]: next });
    // Optimistic; best-effort write
    try {
      await fetch(`/api/pages/${pageId}/blocks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, checked: next }),
      });
    } catch (e) {
      setChecks({ ...checks, [blockId]: !next });
    }
  };

  const patch = (body) => fetch(`/api/pages/${pageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const handleToggleCompleted = async () => {
    if (!pageId || !page) return;
    const current = !!page.properties?.completed;
    setPage({...page, properties: {...page.properties, completed: !current}});
    try {
      const r = await patch({ completed: !current });
      if (!r.ok) throw new Error("patch fail");
    } catch (e) {
      setPage({...page, properties: {...page.properties, completed: current}});
    }
  };

  const STATUS_CYCLE = ["Not Started", "In Progress", "Done"];
  const handleCycleStatus = async () => {
    if (!pageId || !page) return;
    const cur = page.properties?.status || "Not Started";
    const idx = STATUS_CYCLE.indexOf(cur);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setPage({...page, properties: {...page.properties, status: next}});
    try {
      const r = await patch({ status: next });
      if (!r.ok) throw new Error("patch fail");
    } catch (e) {
      setPage({...page, properties: {...page.properties, status: cur}});
    }
  };

  const PRIORITY_CYCLE = ["낮음", "중간", "높음"];
  const handleCyclePriority = async () => {
    if (!pageId || !page) return;
    const cur = page.properties?.priority || "중간";
    const idx = PRIORITY_CYCLE.indexOf(cur);
    const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
    setPage({...page, properties: {...page.properties, priority: next}});
    try {
      const r = await patch({ properties: { Priority: { select: { name: next } } } });
      if (!r.ok) throw new Error("patch fail");
    } catch (e) {
      setPage({...page, properties: {...page.properties, priority: cur}});
    }
  };

  const handleSaveTitle = async (newTitle) => {
    if (!pageId || !page || !newTitle.trim()) return;
    setPage({...page, title: newTitle});
    try {
      await patch({ title: newTitle });
    } catch (e) {}
  };

  const title = page?.title || (loading ? "불러오는 중..." : "(제목 없음)");
  const iconRaw = page?.icon || null;
  const iconType = page?.iconType || null;
  const cover = page?.cover || null; // null → no cover block
  const props = page?.properties || {};

  // Build property rows dynamically — clickable to edit
  const propRows = [];
  // Only show completion checkbox when the DB actually has the property
  if (props.completed !== null && props.completed !== undefined) {
    propRows.push({
      k: "완료",
      v: (
        <button
          type="button"
          onClick={handleToggleCompleted}
          aria-label={props.completed ? "완료 취소" : "완료"}
          style={{
            width: 22, height: 22, borderRadius: 5,
            border: props.completed ? "none" : "1.5px solid var(--n-border-strong)",
            background: props.completed ? "var(--n-accent)" : "transparent",
            display: "grid", placeItems: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {props.completed && <Icon name="check" size={13} color="var(--n-bg)"/>}
        </button>
      ),
    });
  }
  if (props.status) {
    propRows.push({
      k: "상태",
      v: (
        <span
          className={`tag tag-${statusToColor(props.status)}`}
          onClick={handleCycleStatus}
          style={{cursor: "pointer"}}
        >
          {props.status}
        </span>
      ),
    });
  }
  if (props.priority) {
    propRows.push({
      k: "우선순위",
      v: (
        <span
          className={`tag tag-${priorityToColor(props.priority)}`}
          onClick={handleCyclePriority}
          style={{cursor: "pointer"}}
        >
          ● {props.priority}
        </span>
      ),
    });
  }
  if (props.dueDate) propRows.push({ k: "기한", v: <span className="t-body">{fmtDate(props.dueDate)}</span> });
  if (props.category) propRows.push({ k: "분류", v: <span className="tag tag-gray">{props.category}</span> });
  if (props.tags && props.tags.length) propRows.push({ k: "태그", v: <span style={{display: "flex", gap: 4, flexWrap: "wrap"}}>{props.tags.map((tg, i) => <span key={i} className="tag tag-gray">#{tg}</span>)}</span> });

  return (
    <>
      <div style={{paddingTop: 54, background: "var(--n-bg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 12px 6px 12px"}}>
        <div style={{display: "flex", alignItems: "center", gap: 4}}>
          <NavIconBtn icon="back" onClick={goBack}/>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 4}}>
          {page?.notionUrl && <NavIconBtn icon="share" onClick={() => window.open(page.notionUrl, "_blank")}/>}
          <NavIconBtn icon="more"/>
        </div>
      </div>

      <div style={{flex: 1, overflowY: "auto", background: "var(--n-bg)"}} className="scroll-fade">
        {/* Cover (only if Notion has one) */}
        {cover && (
          <div style={{height: 140, position: "relative"}}>
            <img src={cover} alt="" style={{width: "100%", height: "100%", objectFit: "cover", display: "block"}}/>
          </div>
        )}
        {/* Icon — image url or emoji, only if Notion has one */}
        {iconRaw && (
          <div style={{
            padding: cover ? "0 20px" : "16px 20px 0",
            marginTop: cover ? -22 : 0,
            position: "relative", zIndex: 1,
          }}>
            {(iconType === "image" || iconType === "custom_emoji") ? (
              <img src={iconRaw} alt="" style={{width: 54, height: 54, borderRadius: 12, objectFit: "cover", boxShadow: cover ? "var(--sh-2)" : "none", background: "var(--n-surface)"}}/>
            ) : (
              <div style={{
                width: 54, height: 54, borderRadius: 12,
                background: cover ? "var(--n-surface)" : "transparent",
                display: "grid", placeItems: "center", fontSize: 44, lineHeight: 1,
                boxShadow: cover ? "var(--sh-2)" : "none",
              }}>{iconRaw}</div>
            )}
          </div>
        )}
        <div style={{padding: iconRaw ? "12px 20px" : "16px 20px"}}>
          <div
            className="t-large-title"
            style={{
              fontSize: 30,
              lineHeight: "36px",
              outline: "none",
              textDecoration: props.completed ? "line-through" : "none",
              color: props.completed ? "var(--n-text-muted)" : "var(--n-text-strong)",
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const v = e.currentTarget.innerText.trim();
              if (v && v !== title) handleSaveTitle(v);
            }}
          >
            {title}
          </div>
        </div>

        {/* Collapsible properties */}
        {propRows.length > 0 && (
          <div style={{padding: "0 20px 4px"}}>
            <button onClick={() => setCollapsed({...collapsed, props: !collapsed.props})} style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--n-text-muted)", padding: "6px 0", fontSize: 13, fontWeight: 500,
            }}>
              <Icon name={collapsed.props ? "chev-r" : "chev-d"} size={14}/>
              속성 {propRows.length}개
            </button>
            {!collapsed.props && (
              <div style={{background: "var(--n-surface-hover)", borderRadius: 10, padding: "4px 0", marginTop: 4}}>
                {propRows.map((r, i) => (
                  <div key={i} style={{display: "flex", alignItems: "center", padding: "8px 14px", gap: 12}}>
                    <div style={{width: 80, color: "var(--n-text-muted)", fontSize: 13, flexShrink: 0}}>{r.k}</div>
                    <div style={{flex: 1}}>{r.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Body blocks (fetched from Notion, recursive) */}
        <div style={{padding: "16px 20px"}}>
          {loading ? (
            <div className="t-footnote muted">블록 불러오는 중...</div>
          ) : blocks.length === 0 ? (
            <div className="t-footnote muted">이 페이지에 블록이 없어요.</div>
          ) : (
            blocks.map((b, i) => <BlockRenderer key={b.id || i} b={b} idx={i} checks={checks} toggleCheck={toggleCheck}/>)
          )}
          <div style={{height: 40}}/>
        </div>

        <TabSpacer/>
      </div>

      {/* Floating glass composer pill — block menu entry */}
      <div style={{position: "absolute", bottom: 94, left: 16, right: 16, zIndex: 30}}>
        <div className="glass" style={{borderRadius: 20, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8}}>
          <button style={{width: 32, height: 32, border: "none", background: "var(--n-surface-hover)", borderRadius: 16, display: "grid", placeItems: "center", cursor: "pointer"}}>
            <Icon name="plus" size={18}/>
          </button>
          <input className="input" placeholder="블록 추가, / 로 명령" style={{flex: 1, background: "transparent", padding: "6px 0"}}/>
          <button style={{width: 32, height: 32, border: "none", background: "transparent", borderRadius: 16, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--n-text-muted)"}}>
            <Icon name="sparkle" size={18}/>
          </button>
        </div>
      </div>

      <TabBar active={0} onChange={i => { if (i === 0) go("home"); else if (i === 1) go("search"); else if (i === 2) go("event-edit"); else if (i === 3) go("inbox"); else if (i === 4) go("settings"); }}/>
    </>
  );
}

/* ── Event edit bottom sheet ───────────────────────────── */
const DB_ID_BY_KEY = {
  tasks:      "242003c7-f7be-804a-9d6e-f76d5d0347b4",
  works:      "241003c7-f7be-8011-8ba4-cecf131df2a0",
  insights:   "241003c7-f7be-800b-b71c-df3acddc5bb8",
  finance:    "28f003c7-f7be-8080-85b4-d73efe3cb896",
  reflection: "31e003c7-f7be-80a0-ab4f-c1e2249f3c24",
};
const DB_LABEL = {
  tasks: "태스크", works: "웍스", insights: "인사이트", finance: "가계부", reflection: "스크립트",
};

function EventEditScreen({ go, goBack, ctx }) {
  const dbKey = ctx?.dbKey || "tasks";
  const subDbId = ctx?.dbId;
  const targetDbId = subDbId || DB_ID_BY_KEY[dbKey] || DB_ID_BY_KEY.tasks;
  const dbLabel = DB_LABEL[dbKey] || "태스크";
  const suggestionsByDb = {
    tasks: ["내일 10시 디자인 리뷰", "금요일 오후 2시 고객 미팅", "다음주 월요일 스탠드업"],
    works: ["새 프로젝트", "리서치", "아이디어"],
    insights: ["오늘의 인사이트", "읽은 자료 정리"],
    finance: ["카페", "교통", "식비"],
    reflection: ["오늘 배운 것", "이번 주 회고"],
  };
  const suggestions = suggestionsByDb[dbKey] || suggestionsByDb.tasks;

  const [title, setTitle] = uS3("");
  const [allDay, setAllDay] = uS3(false);
  const [saving, setSaving] = uS3(false);
  const [saveError, setSaveError] = uS3(null);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbId: targetDbId, title: title.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      goBack ? goBack() : go("home");
    } catch (e) {
      setSaveError(e.message || "저장 실패");
      setSaving(false);
    }
  };
  return (
    <>
      {/* Dim backdrop */}
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 20,
      }} onClick={() => goBack ? goBack() : go("home")}/>

      {/* Sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 21,
        background: "var(--n-bg-grouped)",
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        maxHeight: "88%", display: "flex", flexDirection: "column",
        boxShadow: "0 -20px 40px rgba(0,0,0,0.15)",
      }}>
        {/* Grabber */}
        <div style={{display: "grid", placeItems: "center", padding: "8px 0 4px"}}>
          <div style={{width: 36, height: 5, borderRadius: 3, background: "var(--n-border-strong)"}}/>
        </div>
        {/* Sheet nav */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 8px"}}>
          <button className="btn btn--ghost btn--sm" onClick={() => goBack ? goBack() : go("home")} style={{padding: "6px 4px"}}>취소</button>
          <div className="t-headline">{saveError ? "저장 실패" : saving ? "저장 중..." : `새 ${dbLabel}`}</div>
          <button className="btn btn--sm btn--primary" onClick={handleSave} disabled={!title.trim() || saving} style={{padding: "6px 14px", opacity: (!title.trim() || saving) ? 0.4 : 1}}>{saving ? "저장중" : "저장"}</button>
        </div>

        <div style={{flex: 1, overflowY: "auto", paddingBottom: 16}}>
          {/* Quick capture */}
          <div style={{padding: "8px 20px 16px"}}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--n-surface)", borderRadius: 14, padding: "14px 14px",
              boxShadow: "var(--sh-1)",
            }}>
              <Icon name="sparkle" size={18} color="#9065B0"/>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder="내일 10시 디자인 리뷰..."
                style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 17, color: "var(--n-text)", font: "inherit"}}/>
              <button style={{border: "none", background: "var(--n-surface-hover)", borderRadius: 18, width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer"}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v10M4 7l5-5 5 5M3 15h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div style={{display: "flex", gap: 6, overflowX: "auto", marginTop: 10}} className="hide-scroll">
              {suggestions.map(s => (
                <button key={s} onClick={() => setTitle(s)} style={{
                  flexShrink: 0, padding: "6px 12px", border: "none",
                  background: "var(--n-surface)", borderRadius: 16, fontSize: 13,
                  cursor: "pointer", color: "var(--n-text-muted)", boxShadow: "var(--sh-1)",
                  whiteSpace: "nowrap",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Form fields (grouped list) */}
          <div className="g-list">
            <div className="g-row">
              <Icon name="clock" size={18} color="var(--n-text-muted)"/>
              <div style={{flex: 1}} className="t-body">하루 종일</div>
              <Toggle on={allDay} onChange={setAllDay}/>
            </div>
            <div className="g-row">
              <div style={{width: 18}}/>
              <div style={{flex: 1}} className="t-body">시작</div>
              <div className="t-body" style={{color: "var(--n-text-muted)"}}>4월 23일 (목) 10:00</div>
            </div>
            <div className="g-row">
              <div style={{width: 18}}/>
              <div style={{flex: 1}} className="t-body">종료</div>
              <div className="t-body" style={{color: "var(--n-text-muted)"}}>4월 23일 (목) 11:00</div>
            </div>
          </div>

          <div className="g-list" style={{marginTop: 16}}>
            <div className="g-row">
              <Icon name="location" size={18} color="var(--n-text-muted)"/>
              <div style={{flex: 1}} className="t-body">장소 추가</div>
            </div>
            <div className="g-row">
              <Icon name="person" size={18} color="var(--n-text-muted)"/>
              <div style={{flex: 1}} className="t-body">참여자</div>
              <Assignees names={["H","K","J"]} size={22}/>
            </div>
            <div className="g-row">
              <Icon name="bell" size={18} color="var(--n-text-muted)"/>
              <div style={{flex: 1}} className="t-body">알림</div>
              <div className="t-body" style={{color: "var(--n-text-muted)"}}>10분 전</div>
            </div>
            <div className="g-row">
              <Icon name="tag" size={18} color="var(--n-text-muted)"/>
              <div style={{flex: 1}} className="t-body">캘린더 DB</div>
              <div style={{display: "flex", alignItems: "center", gap: 6}}>
                <div className="icon-tile" style={{width: 22, height: 22, background: "#DDEBF1", color: "#337EA9"}}>📅</div>
                <div className="t-body">캘린더</div>
              </div>
            </div>
          </div>

          <div className="g-list" style={{marginTop: 16}}>
            <div className="g-row" style={{alignItems: "flex-start", padding: "12px 16px"}}>
              <Icon name="menu" size={18} color="var(--n-text-muted)" style={{marginTop: 2}}/>
              <textarea placeholder="메모 및 설명..." rows={3}
                style={{flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", font: "inherit", fontSize: 17, color: "var(--n-text)"}}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Settings ──────────────────────────────────────── */
function SettingsScreen({ go, goBack, dark, setDark }) {
  const [connected, setConnected] = uS3(null);
  const [profileName] = uS3(() => localStorage.getItem("nm-profile-name") || "효율");
  const [profileWorkspace] = uS3(() => localStorage.getItem("nm-profile-workspace") || "Beyondworks");
  const [profilePlan] = uS3(() => localStorage.getItem("nm-profile-plan") || "Pro");
  const [fontSize, setFontSize] = uS3(() => localStorage.getItem("nm-font-size") || "기본");
  const [language, setLanguage] = uS3(() => localStorage.getItem("nm-lang") || "한국어");
  const [offline, setOffline] = uS3(() => localStorage.getItem("nm-offline") !== "0");
  const [notify, setNotify] = uS3(() => localStorage.getItem("nm-notify") === "1");
  const [cacheSize, setCacheSize] = uS3("—");

  uE3(() => {
    fetch("/api/tasks")
      .then(r => r.ok ? r.json() : { mock: true })
      .then(j => setConnected(!j.mock))
      .catch(() => setConnected(false));
    // Estimate cache
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(est => {
        const mb = ((est.usage || 0) / 1024 / 1024).toFixed(1);
        setCacheSize(`${mb} MB`);
      });
    }
  }, []);

  // Apply font size via data-font-size attribute (drives CSS var overrides)
  uE3(() => {
    if (fontSize === "기본") {
      document.documentElement.removeAttribute("data-font-size");
    } else {
      document.documentElement.setAttribute("data-font-size", fontSize);
    }
    localStorage.setItem("nm-font-size", fontSize);
  }, [fontSize]);

  uE3(() => {
    const prev = localStorage.getItem("nm-lang") || "한국어";
    localStorage.setItem("nm-lang", language);
    document.documentElement.setAttribute("lang", language === "English" ? "en" : "ko");
    // Force re-render via location reload once language actually changes
    if (prev !== language) {
      // defer to let the button press settle
      setTimeout(() => window.location.reload(), 120);
    }
  }, [language]);
  uE3(() => { localStorage.setItem("nm-offline", offline ? "1" : "0"); }, [offline]);

  const cycleFontSize = () => {
    const opts = ["작게", "기본", "크게", "아주 크게"];
    const i = opts.indexOf(fontSize);
    setFontSize(opts[(i + 1) % opts.length]);
  };
  const cycleLanguage = () => {
    const opts = ["한국어", "English"];
    const i = opts.indexOf(language);
    setLanguage(opts[(i + 1) % opts.length]);
  };
  const handleNotify = (v) => {
    if (v && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(p => {
        const ok = p === "granted";
        setNotify(ok);
        localStorage.setItem("nm-notify", ok ? "1" : "0");
        if (!ok) alert("알림 권한이 필요합니다. 브라우저 설정에서 허용해주세요.");
      });
    } else {
      setNotify(v);
      localStorage.setItem("nm-notify", v ? "1" : "0");
    }
  };
  const clearCache = () => {
    if (!confirm("로컬 캐시와 설정(테마 제외)을 모두 지웁니다. 계속하시겠어요?")) return;
    const keepKeys = ["nm-dark"];
    const kept = {};
    keepKeys.forEach(k => { kept[k] = localStorage.getItem(k); });
    localStorage.clear();
    Object.entries(kept).forEach(([k, v]) => v !== null && localStorage.setItem(k, v));
    if (caches && caches.keys) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
    }
    alert("캐시를 비웠습니다.");
    setCacheSize("0 MB");
  };
  const statusText = connected === null ? "확인 중..." : connected ? "연결됨 · 실시간 동기화" : "Demo 모드 · 토큰 필요";
  const statusBg = connected ? "#DDEDEA" : "#FDEBEC";
  const statusFg = connected ? "#448361" : "#D44C47";
  const statusIcon = connected ? "✓" : "!";

  return (
    <>
      <NavBar title="설정" subtitle={`${profileName}'s workspace`}
        left={<NavIconBtn icon="back" onClick={goBack}/>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="scroll-fade">
        {/* Account card */}
        <div style={{padding: "4px 16px 16px"}}>
          <div onClick={() => go("profile")}
            className="g-row--tap"
            style={{background: "var(--n-surface)", borderRadius: 22, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "var(--sh-1)", cursor: "pointer"}}>
            <Avatar name={profileName} size={52}/>
            <div style={{flex: 1}}>
              <div className="t-headline">{profileName}</div>
              <div className="t-footnote">{profileWorkspace} · {profilePlan}</div>
            </div>
            <div className="chev"/>
          </div>
        </div>

        <div className="g-header">연결</div>
        <div className="g-list">
          <div className="g-row g-row--with-icon" onClick={() => go("token")} style={{cursor: "pointer"}}>
            <div className="icon-tile" style={{background: statusBg, color: statusFg}}>{statusIcon}</div>
            <div style={{flex: 1}}>
              <div className="t-body">Notion API</div>
              <div className="t-footnote">{statusText}</div>
            </div>
            <div className="chev"/>
          </div>
          <div className="g-row g-row--with-icon g-row--tap" onClick={() => go("db-picker")} style={{cursor: "pointer"}}>
            <div className="icon-tile" style={{background: "var(--n-surface-hover)"}}>◆</div>
            <div style={{flex: 1}}>
              <div className="t-body">표시할 DB 선택</div>
              <div className="t-footnote">홈 shelf에 핀할 DB</div>
            </div>
            <div className="chev"/>
          </div>
          <div className="g-row g-row--with-icon">
            <div className="icon-tile">🔔</div>
            <div style={{flex: 1}}><div className="t-body">알림</div></div>
            <Toggle on={notify} onChange={handleNotify}/>
          </div>
        </div>

        <div className="g-header">표시</div>
        <div className="g-list">
          <div className="g-row g-row--with-icon">
            <div className="icon-tile">🌙</div>
            <div style={{flex: 1}} className="t-body">다크 모드</div>
            <Toggle on={dark} onChange={setDark}/>
          </div>
          <div className="g-row g-row--with-icon g-row--tap" onClick={cycleFontSize} style={{cursor: "pointer"}}>
            <div className="icon-tile">Aa</div>
            <div style={{flex: 1}} className="t-body">글자 크기</div>
            <div className="t-body" style={{color: "var(--n-text-muted)"}}>{fontSize}</div>
            <div className="chev"/>
          </div>
          <div className="g-row g-row--with-icon g-row--tap" onClick={cycleLanguage} style={{cursor: "pointer"}}>
            <div className="icon-tile">🌐</div>
            <div style={{flex: 1}} className="t-body">언어</div>
            <div className="t-body" style={{color: "var(--n-text-muted)"}}>{language}</div>
            <div className="chev"/>
          </div>
        </div>

        <div className="g-header">데이터</div>
        <div className="g-list">
          <div className="g-row g-row--with-icon">
            <div className="icon-tile">📥</div>
            <div style={{flex: 1}} className="t-body">오프라인 저장</div>
            <Toggle on={offline} onChange={setOffline}/>
          </div>
          <div className="g-row g-row--with-icon g-row--tap" onClick={clearCache} style={{cursor: "pointer"}}>
            <div className="icon-tile">🗑</div>
            <div style={{flex: 1}} className="t-body">캐시 비우기</div>
            <div className="t-footnote">{cacheSize}</div>
          </div>
        </div>

        <div style={{padding: "24px 20px", textAlign: "center"}}>
          <div className="t-footnote">Notion Mobile v0.1 · Artiwave</div>
        </div>

        <TabSpacer/>
      </div>
      <TabBar active={4} onChange={i => { if (i === 0) go("home"); else if (i === 1) go("search"); else if (i === 2) go("event-edit"); else if (i === 3) go("inbox"); else if (i === 4) go("settings"); }}/>
    </>
  );
}


/* ── Profile: 이름/워크스페이스/아바타 편집 + 사이닝아웃 ────────── */
function ProfileScreen({ go, goBack }) {
  const [name, setName] = uS3(() => localStorage.getItem("nm-profile-name") || "효율");
  const [workspace, setWorkspace] = uS3(() => localStorage.getItem("nm-profile-workspace") || "Beyondworks");
  const [plan, setPlan] = uS3(() => localStorage.getItem("nm-profile-plan") || "Pro");
  const [avatar, setAvatar] = uS3(() => localStorage.getItem("nm-profile-avatar") || "");
  const [saved, setSaved] = uS3(false);

  const save = () => {
    localStorage.setItem("nm-profile-name", name.trim() || "효율");
    localStorage.setItem("nm-profile-workspace", workspace.trim() || "Beyondworks");
    localStorage.setItem("nm-profile-plan", plan);
    localStorage.setItem("nm-profile-avatar", avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const resetAll = () => {
    if (!confirm("모든 로컬 설정을 초기화합니다 (Notion 연결 제외). 계속하시겠어요?")) return;
    const keepKeys = ["nm-profile-name"]; // preserve name only
    const kept = {};
    keepKeys.forEach(k => kept[k] = localStorage.getItem(k));
    localStorage.clear();
    Object.entries(kept).forEach(([k, v]) => v !== null && localStorage.setItem(k, v));
    document.documentElement.removeAttribute("data-theme");
    window.location.reload();
  };

  const signOut = () => {
    if (!confirm("로그아웃하면 Notion 토큰 설정 화면으로 이동합니다.")) return;
    go("token");
  };

  return (
    <>
      <NavBar title="프로필" large={false}
        left={<NavIconBtn icon="back" onClick={goBack}/>}
        right={<button className="btn btn--sm btn--primary" onClick={save} style={{padding: "6px 14px"}}>{saved ? "✓ 저장됨" : "저장"}</button>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="scroll-fade">
        {/* Avatar */}
        <div style={{padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14}}>
          <div style={{
            width: 88, height: 88, borderRadius: 44,
            background: avatar ? "transparent" : "var(--n-tag-blue-fg)",
            display: "grid", placeItems: "center",
            color: "#fff", fontSize: 36, fontWeight: 600,
            overflow: "hidden",
          }}>
            {avatar && /^https?:\/\//.test(avatar) ? (
              <img src={avatar} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}}/>
            ) : avatar ? (
              <span style={{fontSize: 44, lineHeight: 1}}>{avatar}</span>
            ) : (
              (name || "효").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="t-footnote muted">아래 "아바타"에 이모지 또는 이미지 URL 입력</div>
        </div>

        <div className="g-header">계정 정보</div>
        <div className="g-list">
          <div className="g-row" style={{padding: "14px 16px", alignItems: "flex-start"}}>
            <div style={{width: 80, color: "var(--n-text-muted)", fontSize: 13, flexShrink: 0, paddingTop: 6}}>이름</div>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="효율"
              style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 17, color: "var(--n-text)", fontFamily: "inherit", padding: "4px 0"}}
            />
          </div>
          <div className="g-row" style={{padding: "14px 16px", alignItems: "flex-start"}}>
            <div style={{width: 80, color: "var(--n-text-muted)", fontSize: 13, flexShrink: 0, paddingTop: 6}}>워크스페이스</div>
            <input
              value={workspace} onChange={e => setWorkspace(e.target.value)}
              placeholder="Beyondworks"
              style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 17, color: "var(--n-text)", fontFamily: "inherit", padding: "4px 0"}}
            />
          </div>
          <div className="g-row" style={{padding: "14px 16px", alignItems: "flex-start"}}>
            <div style={{width: 80, color: "var(--n-text-muted)", fontSize: 13, flexShrink: 0, paddingTop: 6}}>아바타</div>
            <input
              value={avatar} onChange={e => setAvatar(e.target.value)}
              placeholder="🌱 또는 https://..."
              style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 17, color: "var(--n-text)", fontFamily: "inherit", padding: "4px 0"}}
            />
          </div>
          <div className="g-row" style={{padding: "14px 16px"}}>
            <div style={{width: 80, color: "var(--n-text-muted)", fontSize: 13, flexShrink: 0}}>요금제</div>
            <div style={{flex: 1, display: "flex", gap: 6}}>
              {["Free", "Plus", "Pro", "Team"].map(p => (
                <button key={p} onClick={() => setPlan(p)} style={{
                  padding: "6px 12px", borderRadius: 14, border: "none",
                  background: plan === p ? "var(--n-accent)" : "var(--n-surface-hover)",
                  color: plan === p ? "var(--n-bg)" : "var(--n-text)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="g-header" style={{marginTop: 18}}>고급</div>
        <div className="g-list">
          <div className="g-row g-row--tap" onClick={resetAll} style={{cursor: "pointer", color: "var(--n-tag-red-fg)"}}>
            <Icon name="sync" size={18} color="var(--n-tag-red-fg)"/>
            <div style={{flex: 1}} className="t-body" style={{flex: 1, color: "var(--n-tag-red-fg)"}}>모든 로컬 설정 초기화</div>
          </div>
          <div className="g-row g-row--tap" onClick={signOut} style={{cursor: "pointer", color: "var(--n-tag-red-fg)"}}>
            <Icon name="lock" size={18} color="var(--n-tag-red-fg)"/>
            <div className="t-body" style={{flex: 1, color: "var(--n-tag-red-fg)"}}>Notion 연결 끊기 / 재연결</div>
          </div>
        </div>

        <div style={{padding: "24px 20px", textAlign: "center"}}>
          <div className="t-footnote muted">변경사항은 이 기기에만 저장됩니다.</div>
        </div>
        <TabSpacer/>
      </div>
    </>
  );
}

Object.assign(window, { PageScreen, EventEditScreen, SettingsScreen, ProfileScreen });
