/* Page view, Event edit sheet, Settings, Sidebar sheet */
const { useState: uS3, useEffect: uE3 } = React;

/* ── Recursive block renderer (supports nested children, tables) ── */
function BlockRenderer({ b, idx, checks, toggleCheck, editBlock, go, depth = 0 }) {
  const indent = depth * 20;

  if (b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3") {
    const fs = b.type === "heading_1" ? 22 : b.type === "heading_2" ? 19 : 17;
    return (
      <EditableText
        tag="div"
        value={b.content}
        className=""
        style={{margin: "16px 0 8px", fontSize: fs, fontWeight: 700, color: "var(--n-text-strong)", paddingLeft: indent, outline: "none"}}
        onCommit={(v) => editBlock && editBlock(b.id, v, b.type)}
      />
    );
  }

  if (b.type === "to_do") {
    return (
      <div style={{paddingLeft: indent}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0"}}>
          <div
            onClick={() => toggleCheck(b.id)}
            style={{
              width: 16, height: 16, borderRadius: 3, marginTop: 4,
              border: checks[b.id] ? "none" : "1.5px solid var(--n-border-strong)",
              background: checks[b.id] ? "var(--n-accent)" : "transparent",
              display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer",
            }}>{checks[b.id] && <Icon name="check" size={11} color="var(--n-bg)"/>}</div>
          <EditableText
            tag="div"
            value={b.content}
            className="t-body"
            style={{
              textDecoration: checks[b.id] ? "line-through" : "none",
              color: checks[b.id] ? "var(--n-text-muted)" : "var(--n-text)",
              outline: "none", flex: 1,
            }}
            onCommit={(v) => editBlock && editBlock(b.id, v, "to_do")}
          />
        </div>
        {b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} editBlock={editBlock} go={go} depth={depth + 1}/>)}
      </div>
    );
  }

  if (b.type === "bulleted_list_item") {
    const bullet = depth === 0 ? "•" : depth === 1 ? "◦" : "▪";
    return (
      <div style={{paddingLeft: indent}}>
        <div style={{display: "flex", gap: 8, padding: "4px 0", alignItems: "flex-start"}}>
          <span style={{color: "var(--n-text-muted)", flexShrink: 0, marginTop: 2}}>{bullet}</span>
          <EditableText
            tag="span"
            className="t-body"
            style={{outline: "none", flex: 1}}
            value={b.content}
            onCommit={(v) => editBlock && editBlock(b.id, v, "bulleted_list_item")}
          />
        </div>
        {b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} editBlock={editBlock} go={go} depth={depth + 1}/>)}
      </div>
    );
  }

  if (b.type === "numbered_list_item") {
    return (
      <div style={{paddingLeft: indent}}>
        <div style={{display: "flex", gap: 8, padding: "4px 0", alignItems: "flex-start"}}>
          <span style={{color: "var(--n-text-muted)", flexShrink: 0, marginTop: 2}}>{idx + 1}.</span>
          <EditableText
            tag="span"
            className="t-body"
            style={{outline: "none", flex: 1}}
            value={b.content}
            onCommit={(v) => editBlock && editBlock(b.id, v, "numbered_list_item")}
          />
        </div>
        {b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} editBlock={editBlock} go={go} depth={depth + 1}/>)}
      </div>
    );
  }

  if (b.type === "toggle") {
    return <ToggleBlock b={b} depth={depth} checks={checks} toggleCheck={toggleCheck} editBlock={editBlock}/>;
  }

  if (b.type === "quote") {
    return (
      <blockquote style={{margin: "8px 0", padding: "4px 12px", borderLeft: "3px solid var(--n-border-strong)", color: "var(--n-text-muted)", marginLeft: indent}}>
        <EditableText
          tag="span"
          className="t-body"
          style={{outline: "none"}}
          value={b.content}
          onCommit={(v) => editBlock && editBlock(b.id, v, "quote")}
        />
      </blockquote>
    );
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
        <EditableText
          tag="div"
          className="t-body"
          style={{flex: 1, outline: "none"}}
          value={b.content}
          onCommit={(v) => editBlock && editBlock(b.id, v, "callout")}
        />
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
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (e.id && go) go("page", { id: e.id });
                  else if (e.url) window.open(e.url, "_blank");
                }}
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
  // Render empty paragraphs with a min-height so they're still clickable/editable
  if (b.type === "paragraph" || !b.type) {
    return (
      <EditableText
        tag="p"
        className="t-body"
        style={{margin: "8px 0", paddingLeft: indent, outline: "none", minHeight: "1.4em"}}
        value={b.content || ""}
        placeholder=" "
        onCommit={(v) => editBlock && editBlock(b.id, v, "paragraph")}
      />
    );
  }
  if (!b.content) return null;
  return <p className="t-body" style={{margin: "8px 0", paddingLeft: indent}}>{b.content}</p>;
}

/**
 * EditableText — contentEditable wrapper that commits on blur only (to avoid caret reset)
 * and preserves user caret position during editing.
 */
function EditableText({ tag = "div", value, onCommit, className, style, placeholder }) {
  const ref = React.useRef(null);
  const Tag = tag;
  // Sync incoming value only when user is not actively editing the node
  React.useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    if (ref.current.innerText !== (value || "")) ref.current.innerText = value || "";
  }, [value]);
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={className}
      style={style}
      data-placeholder={placeholder || ""}
      onBlur={(e) => {
        const next = e.currentTarget.innerText.replace(/\u00A0/g, " ").replace(/\n+$/, "");
        if (next !== (value || "")) onCommit && onCommit(next);
      }}
      onKeyDown={(e) => {
        // Blur on Enter (single-line blocks) if not Shift+Enter
        if (e.key === "Enter" && !e.shiftKey && tag !== "p") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >{value || ""}</Tag>
  );
}

function ToggleBlock({ b, depth, checks, toggleCheck, editBlock }) {
  const [open, setOpen] = uS3(false);
  const indent = depth * 20;
  return (
    <div style={{paddingLeft: indent}}>
      <div style={{display: "flex", alignItems: "center", gap: 6, padding: "6px 0"}}>
        <span onClick={() => setOpen(!open)} style={{cursor: "pointer", display: "inline-flex"}}>
          <Icon name={open ? "chev-d" : "chev-r"} size={14}/>
        </span>
        <EditableText
          tag="span"
          className="t-body"
          style={{fontWeight: 500, outline: "none", flex: 1}}
          value={b.content}
          onCommit={(v) => editBlock && editBlock(b.id, v, "toggle")}
        />
      </div>
      {open && b.children && b.children.map((c, i) => <BlockRenderer key={c.id || i} b={c} idx={i} checks={checks} toggleCheck={toggleCheck} editBlock={editBlock} go={go} depth={depth + 1}/>)}
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

function plainRichText(list) {
  return Array.isArray(list) ? list.map(t => t?.plain_text || "").join("") : "";
}

function pagePropValueForEdit(prop) {
  if (!prop) return "";
  const type = prop.type;
  if (type === "rich_text") return plainRichText(prop.rich_text);
  if (type === "select") return prop.select?.name || "";
  if (type === "status") return prop.status?.name || "";
  if (type === "multi_select") return Array.isArray(prop.multi_select) ? prop.multi_select.map(v => v?.name).filter(Boolean) : [];
  if (type === "checkbox") return !!prop.checkbox;
  if (type === "date") {
    const start = prop.date?.start || "";
    if (!start) return "";
    if (start.includes("T")) return start.slice(0, 16);
    return `${start}T00:00`;
  }
  if (type === "number") return prop.number ?? "";
  if (type === "url") return prop.url || "";
  if (type === "email") return prop.email || "";
  if (type === "phone_number") return prop.phone_number || "";
  if (type === "relation") return Array.isArray(prop.relation) ? prop.relation.map(v => v?.id).filter(Boolean) : [];
  return "";
}

function buildEditablePageSchema(rawProps, schema) {
  const byName = new Map((schema || []).map(p => [p.name, p]));
  return Object.entries(rawProps || {})
    .map(([name, raw]) => {
      const type = raw?.type || "unknown";
      const fromSchema = byName.get(name) || {};
      return {
        name,
        type,
        options: fromSchema.options || [],
        format: fromSchema.format || null,
        relationDatabaseId: fromSchema.relationDatabaseId || null,
      };
    })
    .filter(prop => prop.type !== "title" && (GENERIC_CREATABLE_TYPES.has(prop.type) || GENERIC_READONLY_TYPES.has(prop.type)));
}

function initialPagePropValues(rawProps) {
  const values = {};
  Object.entries(rawProps || {}).forEach(([name, prop]) => {
    if (prop?.type === "title") return;
    values[name] = pagePropValueForEdit(prop);
  });
  return values;
}

function PageScreen({ go, goBack, ctx }) {
  const [collapsed, setCollapsed] = uS3({ props: false });
  const [page, setPage] = uS3(null);
  const [blocks, setBlocks] = uS3([]);
  const [loading, setLoading] = uS3(true);
  const [saving, setSaving] = uS3(false);
  const [checks, setChecks] = uS3({});
  const [moreOpen, setMoreOpen] = uS3(false);
  const [composer, setComposer] = uS3("");
  const [addingBlock, setAddingBlock] = uS3(false);
  const [pageSchema, setPageSchema] = uS3([]);
  const [pagePropValues, setPagePropValues] = uS3({});
  const [propDirty, setPropDirty] = uS3(false);
  const [propSaving, setPropSaving] = uS3(false);

  const pageId = ctx?.id;

  const fetchPage = React.useCallback(() => {
    if (!pageId) return;
    const pageUrl = `/api/pages/${pageId}`;
    const blocksUrl = `/api/pages/${pageId}/blocks`;
    Promise.all([
      window.nmFetch(pageUrl).then(j => j || null),
      window.nmFetch(blocksUrl).then(j => j || null),
    ]).then(([pageRes, blocksRes]) => {
      // /api/pages/[id] returns flat shape: {id, title, cover, icon, properties, ...}
      setPage(pageRes || null);
      if (pageRes?.id) {
        const cat =
          pageRes.properties?.category ||
          pageRes.properties?.status ||
          (pageRes.parentDbId ? "페이지" : "페이지");
        window.nmTrackRecentPage && window.nmTrackRecentPage({
          id: pageRes.id,
          title: pageRes.title,
          sub: cat,
          icon: pageRes.iconType === "emoji" ? pageRes.icon : "📄",
        });
      }
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
    if (!window.__nmCache?.has(`/api/pages/${pageId}`)) setLoading(true);
    fetchPage();
    const onVis = () => { if (!document.hidden) fetchPage(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", fetchPage);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", fetchPage); };
  }, [pageId, fetchPage]);

  uE3(() => {
    if (!page?.propertiesRaw) return;
    setPagePropValues(initialPagePropValues(page.propertiesRaw));
    setPropDirty(false);
  }, [page?.id, page?.lastEditedAt]);

  uE3(() => {
    if (!page?.parentDbId) {
      setPageSchema([]);
      return;
    }
    let mounted = true;
    window.nmFetch(`/api/database-pages?dbId=${encodeURIComponent(page.parentDbId)}`, { ttl: 120000 })
      .then(j => {
        if (mounted) setPageSchema(Array.isArray(j?.schema) ? j.schema : []);
      })
      .catch(() => {
        if (mounted) setPageSchema([]);
      });
    return () => { mounted = false; };
  }, [page?.parentDbId]);

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
      window.nmInvalidate && window.nmInvalidate(`/api/pages/${pageId}/blocks`);
    } catch (e) {
      setChecks({ ...checks, [blockId]: !next });
    }
  };

  // Update a block's text content. Walks the tree (incl. children) to patch
  // optimistically, then persists to Notion; rolls back on failure.
  const editBlock = async (blockId, content, blockType) => {
    const prev = blocks;
    const patchTree = (list) => list.map((blk) => {
      if (blk.id === blockId) return { ...blk, content };
      if (Array.isArray(blk.children)) return { ...blk, children: patchTree(blk.children) };
      return blk;
    });
    setBlocks(patchTree(blocks));
    try {
      const r = await fetch(`/api/pages/${pageId}/blocks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, content, blockType }),
      });
      if (!r.ok) throw new Error(`PATCH failed ${r.status}`);
      window.nmInvalidate && window.nmInvalidate(`/api/pages/${pageId}/blocks`);
    } catch (e) {
      console.warn("[editBlock rollback]", e);
      setBlocks(prev);
    }
  };

  const invalidatePageLists = () => {
    ["/api/tasks", "/api/works", "/api/insights", "/api/finance", "/api/reflection"].forEach(k => {
      window.nmInvalidate && window.nmInvalidate(k);
    });
  };

  const patch = (body) => fetch(`/api/pages/${pageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => {
    if (r.ok) {
      window.nmInvalidate && window.nmInvalidate(`/api/pages/${pageId}`);
      invalidatePageLists();
    }
    return r;
  });

  const blockFromComposer = (raw) => {
    const text = (raw || "").trim();
    const rich = (content) => [{ type: "text", text: { content } }];
    if (!text) return null;
    const commands = [
      ["/h1 ", "heading_1"],
      ["/h2 ", "heading_2"],
      ["/h3 ", "heading_3"],
      ["/todo ", "to_do"],
      ["/check ", "to_do"],
      ["/bullet ", "bulleted_list_item"],
      ["/bul ", "bulleted_list_item"],
      ["/num ", "numbered_list_item"],
      ["/quote ", "quote"],
      ["/callout ", "callout"],
    ];
    let type = "paragraph";
    let content = text;
    commands.forEach(([prefix, nextType]) => {
      if (content.toLowerCase().startsWith(prefix)) {
        type = nextType;
        content = content.slice(prefix.length).trim();
      }
    });
    if (!content && type !== "to_do") return null;
    if (type === "to_do") return { object: "block", type, [type]: { rich_text: rich(content || "새 할 일"), checked: false } };
    return { object: "block", type, [type]: { rich_text: rich(content) } };
  };

  const appendComposerBlock = async () => {
    if (!pageId || addingBlock) return;
    const block = blockFromComposer(composer);
    if (!block) return;
    setAddingBlock(true);
    const tempId = `temp-${Date.now()}`;
    const tempType = block.type;
    const tempContent = block[tempType]?.rich_text?.map(t => t.text?.content || "").join("") || "";
    setBlocks(curr => [...curr, { id: tempId, type: tempType, content: tempContent, checked: false }]);
    setComposer("");
    try {
      const r = await fetch(`/api/pages/${pageId}/blocks`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ blocks: [block] }),
      });
      if (!r.ok) throw new Error(`append failed ${r.status}`);
      window.nmInvalidate && window.nmInvalidate(`/api/pages/${pageId}/blocks`);
      setTimeout(fetchPage, 150);
    } catch (e) {
      setBlocks(curr => curr.filter(b => b.id !== tempId));
      setComposer(tempContent);
      window.nmToast && window.nmToast("블록 추가 실패");
    } finally {
      setAddingBlock(false);
    }
  };

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
    window.nmTrackRecentPage && window.nmTrackRecentPage({
      id: pageId,
      title: newTitle,
      sub: page.properties?.category || page.properties?.status || "페이지",
      icon: page.iconType === "emoji" ? page.icon : "📄",
    });
    try {
      await patch({ title: newTitle });
    } catch (e) {}
  };

  const handleSaveProperties = async () => {
    if (!pageId || !page || propSaving) return;
    const schema = buildEditablePageSchema(page.propertiesRaw, pageSchema);
    const properties = buildGenericPageProperties(schema, pagePropValues);
    if (!Object.keys(properties).length) return;
    setPropSaving(true);
    try {
      const r = await patch({ properties });
      if (!r.ok) throw new Error("property patch failed");
      setPropDirty(false);
      setTimeout(fetchPage, 150);
    } catch (e) {
      window.nmToast && window.nmToast("속성 저장 실패");
    } finally {
      setPropSaving(false);
    }
  };

  const title = page?.title || (loading ? "불러오는 중..." : "(제목 없음)");
  const iconRaw = page?.icon || null;
  const iconType = page?.iconType || null;
  const cover = page?.cover || null; // null → no cover block
  const props = page?.properties || {};
  const editablePageProps = buildEditablePageSchema(page?.propertiesRaw, pageSchema);
  const originalUrl = page?.notionUrl || (pageId ? `https://notion.so/${String(pageId).replace(/-/g, "")}` : "");

  const refreshPage = () => {
    window.nmInvalidate && window.nmInvalidate(`/api/pages/${pageId}`);
    setLoading(true);
    fetchPage();
    setMoreOpen(false);
    window.nmToast && window.nmToast("새로고침 중");
  };
  const copyPageLink = async () => {
    const ok = await window.nmCopyText(originalUrl);
    window.nmToast && window.nmToast(ok ? "링크 복사됨" : "복사 권한 필요");
    setMoreOpen(false);
  };
  const archivePage = async () => {
    if (!pageId) return;
    if (!confirm("이 페이지를 Notion에서 아카이브할까요?")) return;
    try {
      const r = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({archived: true}),
      });
      if (!r.ok) throw new Error(`archive failed ${r.status}`);
      ["/api/tasks", "/api/works", "/api/insights", "/api/finance", "/api/reflection", `/api/pages/${pageId}`, `/api/pages/${pageId}/blocks`].forEach(k => window.nmInvalidate && window.nmInvalidate(k));
      window.nmRemoveRecentPage && window.nmRemoveRecentPage(pageId);
      window.nmToast && window.nmToast("아카이브됨");
      setMoreOpen(false);
      goBack ? goBack() : go("home");
    } catch (e) {
      window.nmToast && window.nmToast("아카이브 실패");
    }
  };

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
          <NavIconBtn icon="more" onClick={() => setMoreOpen(true)}/>
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
        {(editablePageProps.length > 0 || propRows.length > 0) && (
          <div style={{padding: "0 20px 4px"}}>
            <button onClick={() => setCollapsed({...collapsed, props: !collapsed.props})} style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--n-text-muted)", padding: "6px 0", fontSize: 13, fontWeight: 500,
            }}>
              <Icon name={collapsed.props ? "chev-r" : "chev-d"} size={14}/>
              속성 {(editablePageProps.length || propRows.length)}개
            </button>
            {!collapsed.props && (
              editablePageProps.length > 0 ? (
                <>
                  <div className="g-list" style={{marginTop: 4}}>
                    {editablePageProps.map(prop => (
                      <GenericPropertyField
                        key={`${prop.name}-${prop.type}`}
                        prop={prop}
                        value={pagePropValues[prop.name]}
                        onChange={(value) => {
                          setPagePropValues(prev => ({...prev, [prop.name]: value}));
                          setPropDirty(true);
                        }}
                      />
                    ))}
                  </div>
                  {propDirty && (
                    <button
                      className="btn btn--primary"
                      onClick={handleSaveProperties}
                      disabled={propSaving}
                      style={{width: "100%", marginTop: 10, justifyContent: "center", opacity: propSaving ? 0.6 : 1}}
                    >
                      {propSaving ? "저장 중..." : "속성 저장"}
                    </button>
                  )}
                </>
              ) : (
                <div style={{background: "var(--n-surface-hover)", borderRadius: 10, padding: "4px 0", marginTop: 4}}>
                  {propRows.map((r, i) => (
                    <div key={i} style={{display: "flex", alignItems: "center", padding: "8px 14px", gap: 12}}>
                      <div style={{width: 80, color: "var(--n-text-muted)", fontSize: 13, flexShrink: 0}}>{r.k}</div>
                      <div style={{flex: 1}}>{r.v}</div>
                    </div>
                  ))}
                </div>
              )
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
            blocks.map((b, i) => <BlockRenderer key={b.id || i} b={b} idx={i} checks={checks} toggleCheck={toggleCheck} editBlock={editBlock} go={go}/>)
          )}
          <div style={{height: 40}}/>
        </div>

        <TabSpacer/>
      </div>

      {/* Floating glass composer pill — block menu entry */}
      <div className="page-composer">
        <div className="glass" style={{borderRadius: 20, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8}}>
          <button
            onClick={appendComposerBlock}
            disabled={!composer.trim() || addingBlock}
            style={{width: 32, height: 32, border: "none", background: "var(--n-surface-hover)", borderRadius: 16, display: "grid", placeItems: "center", cursor: composer.trim() ? "pointer" : "default", opacity: composer.trim() ? 1 : 0.55}}>
            <Icon name="plus" size={18}/>
          </button>
          <input
            className="input"
            placeholder="블록 추가, / 로 명령"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                appendComposerBlock();
              }
            }}
            style={{flex: 1, background: "transparent", padding: "6px 0"}}
          />
          <button
            onClick={() => setComposer(c => c.trim().startsWith("/") ? c : `/todo ${c}`)}
            style={{width: 32, height: 32, border: "none", background: "transparent", borderRadius: 16, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--n-text-muted)"}}>
            <Icon name="sparkle" size={18}/>
          </button>
        </div>
      </div>

      <TabBar active={0} onChange={i => {
        if (i === 0) go("home");
        else if (i === 1) go("search");
        else if (i === 2) go("event-edit", page?.parentDbId ? { dbId: page.parentDbId, subTitle: "현재 DB" } : {});
        else if (i === 3) go("inbox");
        else if (i === 4) go("settings");
      }}/>

      <ActionSheet open={moreOpen} title="페이지" subtitle={title} onClose={() => setMoreOpen(false)}>
        <ActionRow icon="share" title="Notion에서 열기" subtitle="원본 페이지 열기" onClick={() => { window.open(originalUrl, "_blank"); setMoreOpen(false); }}/>
        <ActionRow icon="link" title="링크 복사" subtitle="Notion URL 복사" onClick={copyPageLink}/>
        <ActionRow icon="sync" title="새로고침" subtitle="페이지와 블록 다시 불러오기" onClick={refreshPage}/>
        <ActionRow icon="archive" title="아카이브" subtitle="Notion에서 페이지 숨기기" tone="danger" onClick={archivePage}/>
      </ActionSheet>
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
function coreDbId3(key) {
  const mapped = window.nmCoreDbId?.(key);
  if (mapped) return mapped;
  if (window.nmConnectionMode?.() === "owner") return DB_ID_BY_KEY[key] || DB_ID_BY_KEY.tasks;
  return null;
}
const DB_LABEL = {
  tasks: "태스크", works: "웍스", insights: "인사이트", finance: "가계부", reflection: "스크립트",
};

const GENERIC_CREATABLE_TYPES = new Set([
  "date",
  "status",
  "select",
  "multi_select",
  "number",
  "checkbox",
  "rich_text",
  "url",
  "email",
  "phone_number",
  "relation",
]);
const GENERIC_READONLY_TYPES = new Set([
  "people",
  "files",
  "formula",
  "rollup",
  "created_time",
  "created_by",
  "last_edited_time",
  "last_edited_by",
]);

function nmDateTimeLocal(date, time) {
  return `${date}T${time}`;
}

function nmDatePayloadValue(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

function initialGenericValues(schema, ctx, nowParts) {
  const values = {};
  const baseDate = ctx?.date || nowParts.date;
  const baseDateTime = nmDateTimeLocal(baseDate, nowParts.time);
  (schema || []).forEach(prop => {
    if (!prop || prop.type === "title") return;
    if (prop.type === "date") values[prop.name] = baseDateTime;
    else if (prop.type === "checkbox") values[prop.name] = false;
    else if (prop.type === "multi_select") values[prop.name] = [];
    else if (prop.type === "relation") values[prop.name] = [];
    else values[prop.name] = "";
  });
  return values;
}

function buildGenericPageProperties(schema, values) {
  const props = {};
  (schema || []).forEach(prop => {
    const name = prop?.name;
    const type = prop?.type;
    if (!name || type === "title" || !GENERIC_CREATABLE_TYPES.has(type)) return;
    const raw = values?.[name];
    if (type === "date") {
      const start = nmDatePayloadValue(raw);
      if (start) props[name] = { date: { start } };
      return;
    }
    if (type === "status") {
      if (raw) props[name] = { status: { name: raw } };
      return;
    }
    if (type === "select") {
      if (raw) props[name] = { select: { name: raw } };
      return;
    }
    if (type === "multi_select") {
      const selected = Array.isArray(raw) ? raw.filter(Boolean) : [];
      if (selected.length) props[name] = { multi_select: selected.map(value => ({ name: value })) };
      return;
    }
    if (type === "number") {
      if (raw !== "" && raw !== null && raw !== undefined) {
        const num = Number(raw);
        if (Number.isFinite(num)) props[name] = { number: num };
      }
      return;
    }
    if (type === "checkbox") {
      props[name] = { checkbox: !!raw };
      return;
    }
    if (type === "relation") {
      const selected = Array.isArray(raw) ? raw.filter(Boolean) : [];
      if (selected.length) props[name] = { relation: selected.map(id => ({ id })) };
      return;
    }
    const text = String(raw || "").trim();
    if (!text) return;
    if (type === "rich_text") props[name] = { rich_text: [{ text: { content: text } }] };
    if (type === "url") props[name] = { url: text };
    if (type === "email") props[name] = { email: text };
    if (type === "phone_number") props[name] = { phone_number: text };
  });
  return props;
}

function GenericPropertyField({ prop, value, onChange }) {
  const options = Array.isArray(prop.options) ? prop.options : [];
  const name = prop.name;
  const [relationOptions, setRelationOptions] = uS3([]);
  const [relationKnown, setRelationKnown] = uS3({});
  const [relationQuery, setRelationQuery] = uS3("");
  const [relationLoading, setRelationLoading] = uS3(false);
  const isRelation = prop.type === "relation";
  uE3(() => {
    if (!isRelation || !prop.relationDatabaseId) {
      setRelationOptions([]);
      setRelationLoading(false);
      return;
    }
    let mounted = true;
    const timer = setTimeout(() => {
      const query = relationQuery.trim();
      const url = `/api/database-pages?dbId=${encodeURIComponent(prop.relationDatabaseId)}&limit=80${query ? `&q=${encodeURIComponent(query)}` : ""}`;
      setRelationLoading(true);
      window.nmFetch(url, { ttl: query ? 15000 : 120000 })
        .then(j => {
          if (!mounted) return;
          const rows = Array.isArray(j?.data) ? j.data : [];
          setRelationOptions(rows);
          setRelationKnown(prev => {
            const next = {...prev};
            rows.forEach(item => {
              if (item?.id) next[item.id] = item;
            });
            return next;
          });
        })
        .catch(() => {
          if (mounted) setRelationOptions([]);
        })
        .finally(() => {
          if (mounted) setRelationLoading(false);
        });
    }, relationQuery.trim() ? 180 : 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isRelation, prop.relationDatabaseId, relationQuery]);
  const labelStyle = {minWidth: 84, maxWidth: 110, color: "var(--n-text)", fontWeight: 500};
  const inputStyle = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "var(--n-text-muted)",
    font: "inherit",
    fontSize: 15,
    textAlign: "right",
  };

  if (prop.type === "date") {
    return (
      <div className="g-row" style={{alignItems: "center"}}>
        <Icon name="calendar" size={18} color="var(--n-text-muted)"/>
        <div className="t-body" style={labelStyle}>{name}</div>
        <input
          type="datetime-local"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      </div>
    );
  }

  if (prop.type === "number") {
    return (
      <div className="g-row" style={{alignItems: "center"}}>
        <Icon name="tag" size={18} color="var(--n-text-muted)"/>
        <div className="t-body" style={labelStyle}>{name}</div>
        <input
          type="number"
          inputMode="decimal"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={inputStyle}
        />
      </div>
    );
  }

  if (prop.type === "checkbox") {
    return (
      <div className="g-row" style={{alignItems: "center"}}>
        <Icon name="check" size={18} color="var(--n-text-muted)"/>
        <div style={{flex: 1}} className="t-body">{name}</div>
        <Toggle on={!!value} onChange={onChange}/>
      </div>
    );
  }

  if (prop.type === "status" || prop.type === "select") {
    return (
      <div className="g-row" style={{flexDirection: "column", alignItems: "stretch", gap: 8}}>
        <div className="property-field-head">
          <Icon name="tag" size={18} color="var(--n-text-muted)"/>
          <div className="t-body property-field-title">{name}</div>
          {value && <div className="t-footnote muted">{value}</div>}
        </div>
        <div className="property-option-row">
          <button
            onClick={() => onChange("")}
            className={`property-chip${!value ? " is-selected" : ""}`}
          >없음</button>
          {options.map(opt => (
            <button
              key={opt.id || opt.name}
              onClick={() => onChange(opt.name)}
              className={`property-chip${value === opt.name ? " is-selected" : ""}`}
            >{opt.name}</button>
          ))}
        </div>
      </div>
    );
  }

  if (prop.type === "multi_select") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="g-row" style={{flexDirection: "column", alignItems: "stretch", gap: 8}}>
        <div className="property-field-head">
          <Icon name="tag" size={18} color="var(--n-text-muted)"/>
          <div className="t-body property-field-title">{name}</div>
          <div className="t-footnote muted">{selected.length}개</div>
        </div>
        <div className="property-option-row">
          {options.map(opt => {
            const on = selected.includes(opt.name);
            return (
              <button
                key={opt.id || opt.name}
                onClick={() => onChange(on ? selected.filter(v => v !== opt.name) : [...selected, opt.name])}
                className={`property-chip${on ? " is-selected" : ""}`}
              >{opt.name}</button>
            );
          })}
        </div>
      </div>
    );
  }

  if (prop.type === "relation") {
    const selected = Array.isArray(value) ? value : [];
    if (!prop.relationDatabaseId) {
      return (
        <div className="g-row" style={{alignItems: "center", opacity: 0.72}}>
          <Icon name="database" size={18} color="var(--n-text-muted)"/>
          <div style={{flex: 1}} className="t-body">{name}</div>
          <div className="t-footnote" style={{color: "var(--n-text-muted)"}}>relation</div>
        </div>
      );
    }

    const shouldShowRelationOptions = selected.length === 0 || !!relationQuery.trim();
    const visibleOptions = shouldShowRelationOptions
      ? relationOptions.filter(item => item?.id && !selected.includes(item.id)).slice(0, 12)
      : [];
    const selectedRows = selected.map(id => relationKnown[id] || relationOptions.find(item => item.id === id) || {id, title: "연결됨"});
    const hasQuery = !!relationQuery.trim();

    return (
      <div className="g-row" style={{flexDirection: "column", alignItems: "stretch", gap: 10}}>
        <div className="property-field-head">
          <Icon name="database" size={18} color="var(--n-text-muted)"/>
          <div className="t-body property-field-title">{name}</div>
          <div className="t-footnote muted" style={{marginLeft: "auto"}}>
            {relationLoading ? "불러오는 중" : `${selected.length}개 선택`}
          </div>
        </div>
        <div style={{
          marginLeft: 28,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--n-surface-hover)",
          borderRadius: 12,
          padding: "8px 10px",
        }}>
          <Icon name="search" size={15} color="var(--n-text-muted)"/>
          <input
            value={relationQuery}
            onChange={e => setRelationQuery(e.target.value)}
            placeholder="연결할 페이지 검색"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--n-text)",
              font: "inherit",
              fontSize: 14,
            }}
          />
          {relationQuery && (
            <button
              onClick={() => setRelationQuery("")}
              aria-label="검색어 지우기"
              style={{
                border: "none",
                background: "transparent",
                color: "var(--n-text-muted)",
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}>×</button>
          )}
        </div>

        {selectedRows.length > 0 && (
          <div className="property-chip-row">
            {selectedRows.map(item => (
              <button
                key={item.id}
                onClick={() => onChange(selected.filter(v => v !== item.id))}
                className="property-chip is-selected"
              >{item.title || "연결됨"} ×</button>
            ))}
          </div>
        )}

        <div className="property-chip-row" style={{maxHeight: 136, overflowY: "auto"}}>
          {visibleOptions.length ? visibleOptions.map(item => (
            <button
              key={item.id}
              onClick={() => onChange([...selected, item.id])}
              className="property-chip"
              title={item.title || "(제목 없음)"}
            >
              <span style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                background: "var(--n-surface)",
                display: "grid",
                placeItems: "center",
                color: "var(--n-text-muted)",
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
              }}>{(item.title || "?").slice(0, 1).toUpperCase()}</span>
              <span style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 180,
              }}>
                {item.title || "(제목 없음)"}
              </span>
            </button>
          )) : (
            <div className="t-footnote muted" style={{padding: "10px 0 4px", textAlign: "left"}}>
              {relationLoading ? "연결할 페이지를 불러오는 중..." : hasQuery ? "검색 결과 없음" : selected.length ? "검색해서 더 연결" : "연결할 페이지 없음"}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (prop.type === "rich_text") {
    return (
      <div className="g-row" style={{alignItems: "flex-start"}}>
        <Icon name="menu" size={18} color="var(--n-text-muted)" style={{marginTop: 2}}/>
        <textarea
          rows={2}
          placeholder={name}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          style={{flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", font: "inherit", fontSize: 16, color: "var(--n-text)"}}
        />
      </div>
    );
  }

  if (prop.type === "url" || prop.type === "email" || prop.type === "phone_number") {
    const inputType = prop.type === "email" ? "email" : prop.type === "url" ? "url" : "tel";
    return (
      <div className="g-row" style={{alignItems: "center"}}>
        <Icon name="share" size={18} color="var(--n-text-muted)"/>
        <div className="t-body" style={labelStyle}>{name}</div>
        <input
          type={inputType}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={prop.type}
          style={inputStyle}
        />
      </div>
    );
  }

  if (GENERIC_READONLY_TYPES.has(prop.type)) {
    return (
      <div className="g-row" style={{alignItems: "center", opacity: 0.72}}>
        <Icon name="database" size={18} color="var(--n-text-muted)"/>
        <div style={{flex: 1}} className="t-body">{name}</div>
        <div className="t-footnote" style={{color: "var(--n-text-muted)"}}>{prop.type}</div>
      </div>
    );
  }

  return null;
}

function EventEditScreen({ go, goBack, ctx }) {
  const dbKey = ctx?.dbKey || (ctx?.dbId ? "custom" : "tasks");
  const subDbId = ctx?.dbId;
  const targetDbId = subDbId || coreDbId3(dbKey);
  const dbLabel = ctx?.subTitle || DB_LABEL[dbKey] || "페이지";
  const isFinance = dbKey === "finance";
  const isTask = dbKey === "tasks";
  const isGenericDb = !!subDbId && !isFinance;
  const suggestionsByDb = {
    tasks: ["내일 10시 디자인 리뷰", "금요일 오후 2시 고객 미팅", "다음주 월요일 스탠드업"],
    works: ["새 프로젝트", "리서치", "아이디어"],
    insights: ["오늘의 인사이트", "읽은 자료 정리"],
    finance: ["카페", "교통", "식비"],
    reflection: ["오늘 배운 것", "이번 주 회고"],
  };
  const suggestions = suggestionsByDb[dbKey] || suggestionsByDb.tasks;

  const [title, setTitle] = uS3("");
  const [allDay, setAllDay] = uS3(true);
  const [saving, setSaving] = uS3(false);
  const [saveError, setSaveError] = uS3(null);
  const nowParts = (() => {
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return { date, time };
  })();
  const todayIso = nowParts.date;
  // Tasks flow — optional date + time (e.g. from calendar "+" with ctx.date)
  const [taskDate, setTaskDate] = uS3(() => ctx?.date || nowParts.date);
  const [taskTime, setTaskTime] = uS3(() => ctx?.date ? "" : nowParts.time); // "HH:MM"
  // Finance-specific state
  const [financeType, setFinanceType] = uS3("지출");
  const [financeAmount, setFinanceAmount] = uS3(""); // string so we can show empty
  const [financeDate, setFinanceDate] = uS3(() => ctx?.date || todayIso);
  const [financeMemo, setFinanceMemo] = uS3("");
  const [genericSchema, setGenericSchema] = uS3([]);
  const [genericLoading, setGenericLoading] = uS3(false);
  const [genericValues, setGenericValues] = uS3({});

  uE3(() => {
    if (!isGenericDb || !targetDbId) return;
    let mounted = true;
    setGenericLoading(true);
    window.nmFetch(`/api/database-pages?dbId=${encodeURIComponent(targetDbId)}`, { ttl: 120000 })
      .then(j => {
        if (!mounted) return;
        const schema = Array.isArray(j?.schema) ? j.schema : [];
        setGenericSchema(schema);
        setGenericValues(initialGenericValues(schema, ctx, nowParts));
      })
      .catch(() => {
        if (!mounted) return;
        setGenericSchema([]);
      })
      .finally(() => {
        if (mounted) setGenericLoading(false);
      });
    return () => { mounted = false; };
  }, [isGenericDb, targetDbId]);

  const invalidateCreatedDb = () => {
    if (subDbId) window.nmInvalidate && window.nmInvalidate(`/api/database-pages?dbId=${subDbId}`);
    const url = window.nmCoreEndpoint?.(dbKey);
    if (url) window.nmInvalidate && window.nmInvalidate(url);
    if (dbKey) window.nmInvalidate && window.nmInvalidate(`/api/${dbKey}`);
    window.nmInvalidate && window.nmInvalidate("/api/databases");
  };

  const handleSave = async () => {
    if (saving) return;
    if (!targetDbId) {
      setSaveError(window.NM_EMPTY_DB_MESSAGE || "노션에서 데이터베이스를 추가해주세요");
      return;
    }
    if (isFinance) {
      const amt = Number(financeAmount);
      if (!title.trim() || !amt || amt <= 0 || !financeType) return;
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch("/api/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            type: financeType,
            amount: amt,
            date: financeDate || undefined,
            memo: financeMemo || undefined,
            dbId: targetDbId,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        invalidateCreatedDb();
        goBack ? goBack() : go("home");
      } catch (e) {
        setSaveError(e.message || "저장 실패");
        setSaving(false);
      }
      return;
    }
    if (!title.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (isGenericDb) {
        const properties = buildGenericPageProperties(genericSchema, genericValues);
        const res = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dbId: targetDbId,
            title: title.trim(),
            properties,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        invalidateCreatedDb();
        goBack ? goBack() : go("home");
        return;
      }

      // Build optional Date property. /api/pages also auto-discovers date property
      // names, but this keeps the common Beyond_Tasks path explicit.
      const extraProps = {};
      if (taskDate) {
        const start = taskTime ? `${taskDate}T${taskTime}:00` : taskDate;
        extraProps["Date"] = { date: { start } };
        extraProps.__defaultDate = start;
      }
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbId: targetDbId,
          title: title.trim(),
          properties: Object.keys(extraProps).length ? extraProps : undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      invalidateCreatedDb();
      goBack ? goBack() : go("home");
    } catch (e) {
      setSaveError(e.message || "저장 실패");
      setSaving(false);
    }
  };

  const canSave = isFinance
    ? (title.trim() && Number(financeAmount) > 0 && financeType)
    : (isGenericDb ? (!!title.trim() && !genericLoading) : !!title.trim());
  const creatableGenericProps = genericSchema.filter(p => p.type !== "title" && (GENERIC_CREATABLE_TYPES.has(p.type) || GENERIC_READONLY_TYPES.has(p.type)));
  return (
    <>
      {/* Dim backdrop */}
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 20,
      }} onClick={() => goBack ? goBack() : go("home")}/>

      {/* Sheet — Phone height already excludes the keyboard via --nm-app-height,
           so anchor at bottom:0 (don't add keyboard offset again) and cap the
           sheet height using the same app-height so it never reaches the notch. */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 21,
        background: "var(--n-bg-grouped)",
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        maxHeight: "calc(var(--nm-app-height, 100dvh) - var(--safe-t, 0px) - 24px)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -20px 40px rgba(0,0,0,0.15)",
        paddingBottom: "calc(var(--safe-b, env(safe-area-inset-bottom, 0px)) + 8px)",
      }}>
        {/* Grabber */}
        <div style={{display: "grid", placeItems: "center", padding: "8px 0 4px"}}>
          <div style={{width: 36, height: 5, borderRadius: 3, background: "var(--n-border-strong)"}}/>
        </div>
        {/* Sheet nav */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 8px"}}>
          <button className="btn btn--ghost btn--sm" onClick={() => goBack ? goBack() : go("home")} style={{padding: "6px 4px"}}>취소</button>
          <div className="t-headline">{saveError ? "저장 실패" : saving ? "저장 중..." : `새 ${dbLabel}`}</div>
          <button className="btn btn--sm btn--primary" onClick={handleSave} disabled={!canSave || saving} style={{padding: "6px 14px", opacity: (!canSave || saving) ? 0.4 : 1}}>{saving ? "저장중" : "저장"}</button>
        </div>
        {saveError && (
          <div className="t-footnote" style={{margin: "0 20px 8px", padding: "9px 12px", borderRadius: 10, color: "#A5483D", background: "#FDEBEC"}}>
            {saveError}
          </div>
        )}

        <div style={{flex: 1, overflowY: "auto", paddingBottom: "calc(24px + var(--safe-b, env(safe-area-inset-bottom, 0px)))"}}>
          {/* Quick capture */}
          <div style={{padding: "8px 20px 16px"}}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--n-surface)", borderRadius: 14, padding: "14px 14px",
              boxShadow: "var(--sh-1)",
            }}>
              <Icon name="sparkle" size={18} color={isFinance ? "#D44C47" : "#9065B0"}/>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
                placeholder={isFinance ? "카페, 점심, 교통 등 항목" : "내일 10시 디자인 리뷰..."}
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

          {isFinance ? (
            <>
              {/* 수입/지출 type segmented */}
              <div className="g-list">
                <div className="g-row" style={{flexDirection: "column", alignItems: "stretch", gap: 8, padding: "14px 16px"}}>
                  <div className="t-caption" style={{color: "var(--n-text-muted)", letterSpacing: "-0.2px"}}>유형</div>
                  <div style={{display: "flex", gap: 6, padding: 3, background: "var(--n-surface-hover)", borderRadius: 10}}>
                    {["수입", "지출"].map(t => (
                      <button
                        key={t}
                        onClick={() => setFinanceType(t)}
                        data-fin-type={t}
                        style={{
                          flex: 1, padding: "8px 12px", border: "none", borderRadius: 8,
                          background: financeType === t ? "var(--n-surface)" : "transparent",
                          color: financeType === t
                            ? (t === "수입" ? "#448361" : "#D44C47")
                            : "var(--n-text-muted)",
                          fontWeight: financeType === t ? 600 : 500,
                          fontSize: 14, cursor: "pointer",
                          boxShadow: financeType === t ? "var(--sh-1)" : "none",
                          transition: "all 140ms ease",
                        }}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount / Date */}
              <div className="g-list" style={{marginTop: 12}}>
                <div className="g-row" style={{alignItems: "center"}}>
                  <Icon name="tag" size={18} color="var(--n-text-muted)"/>
                  <div style={{flex: 1}} className="t-body">금액</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    data-fin-amount
                    value={financeAmount}
                    onChange={e => setFinanceAmount(e.target.value)}
                    placeholder="0"
                    style={{
                      width: 140, border: "none", outline: "none", background: "transparent",
                      textAlign: "right", fontSize: 17, color: "var(--n-text)",
                      fontWeight: 600, fontVariantNumeric: "tabular-nums",
                    }}/>
                  <span className="t-body" style={{color: "var(--n-text-muted)", marginLeft: 4}}>원</span>
                </div>
                <div className="g-row" style={{alignItems: "center"}}>
                  <Icon name="calendar" size={18} color="var(--n-text-muted)"/>
                  <div style={{flex: 1}} className="t-body">날짜</div>
                  <input
                    type="date"
                    data-fin-date
                    value={financeDate}
                    onChange={e => setFinanceDate(e.target.value)}
                    style={{
                      border: "none", outline: "none", background: "transparent",
                      fontSize: 15, color: "var(--n-text-muted)", font: "inherit",
                    }}/>
                </div>
              </div>

              {/* Memo */}
              <div className="g-list" style={{marginTop: 12}}>
                <div className="g-row" style={{alignItems: "flex-start", padding: "12px 16px"}}>
                  <Icon name="menu" size={18} color="var(--n-text-muted)" style={{marginTop: 2}}/>
                  <textarea
                    placeholder="메모 (선택)"
                    rows={2}
                    data-fin-memo
                    value={financeMemo}
                    onChange={e => setFinanceMemo(e.target.value)}
                    style={{flex: 1, border: "none", outline: "none", background: "transparent", resize: "none", font: "inherit", fontSize: 16, color: "var(--n-text)"}}/>
                </div>
              </div>
            </>
          ) : isGenericDb ? (
            <>
              <div className="g-list">
                {genericLoading ? (
                  <div className="g-row">
                    <div style={{flex: 1, textAlign: "center"}} className="t-body muted">속성 불러오는 중...</div>
                  </div>
                ) : creatableGenericProps.length ? (
                  creatableGenericProps.map(prop => (
                    <GenericPropertyField
                      key={`${prop.name}-${prop.type}`}
                      prop={prop}
                      value={genericValues[prop.name]}
                      onChange={(value) => setGenericValues(prev => ({...prev, [prop.name]: value}))}
                    />
                  ))
                ) : (
                  <div className="g-row">
                    <div style={{flex: 1, textAlign: "center"}} className="t-body muted">추가 가능한 속성 없음</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Form fields (grouped list) */}
              <div className="g-list">
                <div className="g-row">
                  <Icon name="clock" size={18} color="var(--n-text-muted)"/>
                  <div style={{flex: 1}} className="t-body">하루 종일</div>
                  <Toggle on={allDay} onChange={(v) => {
                    setAllDay(v);
                    if (v) setTaskTime("");
                    else if (!taskTime) setTaskTime(nowParts.time);
                  }}/>
                </div>
                <div className="g-row" style={{alignItems: "center"}}>
                  <Icon name="calendar" size={18} color="var(--n-text-muted)"/>
                  <div style={{flex: 1}} className="t-body">날짜</div>
                  <input
                    type="date"
                    data-task-date
                    value={taskDate}
                    onChange={e => setTaskDate(e.target.value)}
                    style={{border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--n-text-muted)", font: "inherit"}}/>
                </div>
                {!allDay && (
                  <div className="g-row" style={{alignItems: "center"}}>
                    <div style={{width: 18}}/>
                    <div style={{flex: 1}} className="t-body">시간</div>
                    <input
                      type="time"
                      data-task-time
                      value={taskTime}
                      onChange={e => setTaskTime(e.target.value)}
                      style={{border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--n-text-muted)", font: "inherit"}}/>
                  </div>
                )}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Settings ──────────────────────────────────────── */
function SettingsScreen({ go, goBack, dark, setDark }) {
  const [connected, setConnected] = uS3(null);
  const [connectionMode, setConnectionMode] = uS3(() => window.nmConnectionMode?.() || "demo");
  const [profileName] = uS3(() => localStorage.getItem("nm-profile-name") || "효율");
  const [profileWorkspace] = uS3(() => localStorage.getItem("nm-profile-workspace") || "Beyondworks");
  const [profilePlan] = uS3(() => localStorage.getItem("nm-profile-plan") || "Pro");
  const [fontSize, setFontSize] = uS3(() => localStorage.getItem("nm-font-size") || "기본");
  const [language, setLanguage] = uS3(() => localStorage.getItem("nm-lang") || "한국어");
  const [offline, setOffline] = uS3(() => localStorage.getItem("nm-offline") !== "0");
  const [notify, setNotify] = uS3(() => localStorage.getItem("nm-notify") === "1");
  const [cacheSize, setCacheSize] = uS3("—");

  uE3(() => {
    window.nmRefreshSession?.().then(s => {
      if (s?.connected) {
        setConnectionMode("oauth");
        setConnected(true);
      }
    });
    window.nmFetch(window.nmCoreEndpoint?.("tasks") || "/api/tasks")
      .then(() => setConnected((window.nmConnectionMode?.() || "demo") !== "demo"))
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
  const logoutNotion = async () => {
    if (!confirm("Notion 연결을 해제하고 데모 모드로 전환할까요?")) return;
    await window.nmLogoutNotion?.();
    setConnectionMode("demo");
    setConnected(false);
    go("token");
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
          {connectionMode === "oauth" && (
            <div className="g-row g-row--with-icon g-row--tap" onClick={logoutNotion} style={{cursor: "pointer"}}>
              <div className="icon-tile" style={{background: "#FDEBEC", color: "#D44C47"}}>×</div>
              <div style={{flex: 1}}>
                <div className="t-body">Notion 로그아웃</div>
                <div className="t-footnote">OAuth 세션과 DB 매핑 제거</div>
              </div>
            </div>
          )}
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
          <div className="t-footnote">Nolio v0.1 · Artiwave</div>
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
