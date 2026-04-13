'use client';

import { useState } from 'react';
import {
  Lightbulb,
  ArrowDownToLine,
  ArrowUpRight,
  Timer,
  Flag,
  AlertCircle,
  Clock3,
  CalendarPlus,
  Receipt,
  FileText,
  Search,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Type,
  Tag,
  Calendar,
  Banknote,
  CalendarClock,
  Coins,
  Check,
  Plus,
  Hash,
  List,
  Layers,
  Image,
  Activity,
  Zap,
  Building2,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import Header from '@/components/Header';
import SectionHead from '@/components/SectionHead';
import MetricCard from '@/components/MetricCard';
import SlideCard from '@/components/SlideCard';
import DBTable from '@/components/DBTable';
import BottomSheet from '@/components/BottomSheet';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useNotionData } from '@/lib/hooks';
import type { Task, FinanceEntry, Insight, Work } from '@/lib/types';

const DB_OPTIONS = ['Beyond_Tasks', '타임라인(가계부)', '예정 수입/지출', 'Insights', 'Works'];
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];

export default function HomePage() {
  const [widgetSheetOpen, setWidgetSheetOpen] = useState(false);
  const [configWidgetType, setConfigWidgetType] = useState<string | null>(null);
  const [configDb, setConfigDb] = useState(DB_OPTIONS[0]);
  const [configSize, setConfigSize] = useState('Medium');
  const [dbDropdownOpen, setDbDropdownOpen] = useState(false);
  const [widgetAddedMsg, setWidgetAddedMsg] = useState(false);

  const { data: tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useNotionData<Task[]>('tasks');
  const { data: finance, loading: financeLoading, error: financeError, refetch: refetchFinance } = useNotionData<FinanceEntry[]>('finance');
  const { data: insights, loading: insightsLoading, error: insightsError } = useNotionData<Insight[]>('insights');
  const { data: works, loading: worksLoading, error: worksError } = useNotionData<Work[]>('works');

  // Metric calculations
  const incomeTotal = finance
    ? finance.filter((f) => f.type === 'income').reduce((sum, f) => sum + f.amount, 0)
    : 0;
  const incomeMan = Math.round(incomeTotal / 10000);

  const undoneTasks = tasks ? tasks.filter((t) => !t.done) : [];
  const undoneCount = undoneTasks.length;

  const dDay = tasks
    ? tasks
        .filter((t) => !t.done && t.dueDate)
        .map((t) => Math.ceil((new Date(t.dueDate!).getTime() - Date.now()) / 86400000))
        .sort((a, b) => a - b)[0] ?? 0
    : 0;

  function handleWidgetSelect(type: string) {
    setWidgetSheetOpen(false);
    setConfigWidgetType(type);
    setConfigDb(DB_OPTIONS[0]);
    setConfigSize('Medium');
    setDbDropdownOpen(false);
  }

  function handleConfigClose() {
    setConfigWidgetType(null);
    setDbDropdownOpen(false);
  }

  function handleConfigBack() {
    setConfigWidgetType(null);
    setDbDropdownOpen(false);
    setWidgetSheetOpen(true);
  }

  function handleWidgetAdd() {
    handleConfigClose();
    setWidgetAddedMsg(true);
    setTimeout(() => setWidgetAddedMsg(false), 2000);
  }

  return (
    <>
      <Header />

      {/* ============ CALLOUT ============ */}
      <div className="callout anim a1">
        <div className="callout-icon">
          <Lightbulb size={11} />
        </div>
        <div className="callout-body">
          <strong>오늘의 포커스</strong> — 해커스 2차시 수정본 전달 · 매직라이트 영상 최종 게시
          <br />
          <span className="muted">오후 2시 세븐플러스 미팅, 저녁 RelayAX 피드백 정리</span>
        </div>
      </div>

      {/* ============ METRICS ============ */}
      <section className="w-section anim a2" style={{ marginTop: 18 }}>
        {(tasksLoading || financeLoading) ? (
          <LoadingSkeleton variant="metric" />
        ) : (
          <div className="metric-strip">
            <MetricCard
              accent="#2a9d99"
              icon={<ArrowDownToLine size={11} />}
              iconColor="teal"
              label="예정 수입"
              value={incomeMan}
              unit="만원"
              valueColor="teal"
              sub={<><ArrowUpRight size={8} /> {finance ? finance.filter((f) => f.type === 'income').length : 0}건 대기</>}
            />
            <MetricCard
              accent="var(--n-red-tx)"
              icon={<Timer size={11} />}
              iconColor="red"
              label="D-Day"
              value={dDay}
              unit="일"
              valueColor="red"
              sub={<><Flag size={8} /> 최근 마감</>}
            />
            <MetricCard
              accent="var(--n-orange-tx)"
              icon={<AlertCircle size={11} />}
              iconColor="orange"
              label="미완료"
              value={undoneCount}
              unit="건"
              valueColor="orange"
              sub={<><Clock3 size={8} /> 마감 지연</>}
            />
          </div>
        )}
      </section>

      {/* ============ QUICK ACTIONS ============ */}
      <section className="w-section anim a3" style={{ marginTop: 14 }}>
        <div className="qa-strip">
          <button className="qa-btn">
            <div className="qa-icon" style={{ background: 'var(--n-blue-bg)', color: 'var(--n-blue-tx)' }}>
              <CalendarPlus size={15} />
            </div>
            <span className="qa-name">일정 추가</span>
          </button>
          <button className="qa-btn">
            <div className="qa-icon" style={{ background: 'var(--n-green-bg)', color: 'var(--n-green-tx)' }}>
              <Receipt size={15} />
            </div>
            <span className="qa-name">지출 기록</span>
          </button>
          <button className="qa-btn">
            <div className="qa-icon" style={{ background: 'var(--n-purple-bg)', color: 'var(--n-purple-tx)' }}>
              <FileText size={15} />
            </div>
            <span className="qa-name">메모</span>
          </button>
          <button className="qa-btn">
            <div className="qa-icon" style={{ background: 'var(--n-gray-bg)', color: 'var(--n-gray-tx)' }}>
              <Search size={15} />
            </div>
            <span className="qa-name">검색</span>
          </button>
        </div>
      </section>

      {/* ============ 인사이트 ============ */}
      <section className="w-section anim a4">
        <SectionHead
          icon={<Sparkles size={10} style={{ color: 'var(--n-purple-tx)' }} />}
          iconColor="var(--n-purple-tx)"
          title="인사이트"
          moreLabel="더보기"
          href="/insights"
        />
        <div className="rail">
          {insightsLoading && <LoadingSkeleton variant="card" />}
          {insightsError && !insightsLoading && (
            <ErrorState message={insightsError} />
          )}
          {!insightsLoading && !insightsError && (insights ?? []).slice(0, 3).map((insight) => (
            <SlideCard
              key={insight.id}
              coverGradient={insight.coverColor}
              coverTag={insight.category}
              coverTagColor="rgba(0,0,0,0.6)"
              title={insight.title}
              desc={insight.description}
              tags={insight.tags.slice(0, 2).map((tag) => ({ label: tag, className: 'n-tag gray' }))}
              href="/insights"
            />
          ))}
        </div>
      </section>

      {/* ============ 웍스 ============ */}
      <section className="w-section anim a5">
        <SectionHead
          icon={<Briefcase size={10} style={{ color: 'var(--n-blue-tx)' }} />}
          iconColor="var(--n-blue-tx)"
          title="웍스"
          moreLabel="더보기"
          href="/works"
        />
        <div className="rail">
          <SlideCard
            coverGradient="linear-gradient(135deg, #e1eef8, #cde0f5)"
            coverTag="기획"
            coverTagColor="var(--n-blue-tx)"
            title="세븐플러스 K-art 기획안"
            desc="기획 방향 1차 검토 완료. 피드백 반영 중."
            tags={[{ label: '완료', className: 'n-status done' }]}
            href="/works"
          />
          <SlideCard
            coverGradient="linear-gradient(135deg, #fef0e4, #f5d9b8)"
            coverTag="Video"
            coverTagColor="var(--n-orange-tx)"
            title="Magiclight 영상 대본"
            desc="초안 전달 완료. 최종 게시 4/14~15 예정."
            tags={[{ label: '진행중', className: 'n-status progress' }]}
            href="/works"
          />
          <SlideCard
            coverGradient="linear-gradient(135deg, #e6f5f4, #b8e0de)"
            coverTag="강의"
            coverTagColor="var(--n-green-tx)"
            title="해커스 바이브코딩 커리큘럼"
            desc="2차시 수정본 작업 중. 피봇 관련 논의 필요."
            tags={[{ label: '진행중', className: 'n-status progress' }]}
            href="/works"
          />
        </div>
      </section>

      {/* ============ 태스크 ============ */}
      <section className="w-section anim a6">
        <SectionHead
          icon={<CheckCircle2 size={10} style={{ color: 'var(--n-red-tx)' }} />}
          iconColor="var(--n-red-tx)"
          title="태스크"
          moreLabel="전체"
          href="/tasks"
        />
        <DBTable
          columns={[
            { key: 'icon', icon: null, label: '', className: 'h-icon' },
            { key: 'name', icon: <Type size={8} />, label: '이름', className: 'h-name' },
            { key: 'tag', icon: <Tag size={8} />, label: '분류', className: 'h-prop' },
            { key: 'date', icon: <Calendar size={8} />, label: '마감', className: 'h-date' },
          ]}
          rows={[
            {
              key: 't1',
              cells: [
                <div key="c" className="db-chk"></div>,
                <div key="t" className="db-title">해커스 2차시 수정본 전달</div>,
                <div key="p" className="db-prop"><span className="n-tag green">강의</span></div>,
                <div key="d" className="db-date warn">4/8</div>,
              ],
            },
            {
              key: 't2',
              cells: [
                <div key="c" className="db-chk"></div>,
                <div key="t" className="db-title">매직라이트 영상 업로드</div>,
                <div key="p" className="db-prop"><span className="n-tag orange">Video</span></div>,
                <div key="d" className="db-date warn">4/8</div>,
              ],
            },
            {
              key: 't3',
              cells: [
                <div key="c" className="db-chk"></div>,
                <div key="t" className="db-title">Magiclight 영상 최종 게시</div>,
                <div key="p" className="db-prop"><span className="n-tag orange">Video</span></div>,
                <div key="d" className="db-date">4/14</div>,
              ],
            },
            {
              key: 't4',
              cells: [
                <div key="c" className="db-chk done"><Check size={7} /></div>,
                <div key="t" className="db-title strike">세븐플러스 미팅</div>,
                <div key="p" className="db-prop"><span className="n-tag gray">회의</span></div>,
                <div key="d" className="db-date">4/10</div>,
              ],
            },
            {
              key: 't5',
              cells: [
                <div key="c" className="db-chk done"><Check size={7} /></div>,
                <div key="t" className="db-title strike">RelayAX 마곡 미팅</div>,
                <div key="p" className="db-prop"><span className="n-tag gray">회의</span></div>,
                <div key="d" className="db-date">4/7</div>,
              ],
            },
          ]}
        />
      </section>

      {/* ============ 파이낸스 ============ */}
      <section className="w-section anim a7">
        <SectionHead
          icon={<Banknote size={10} style={{ color: '#2a9d99' }} />}
          iconColor="#2a9d99"
          title="파이낸스"
          moreLabel="더보기"
          href="/finance"
        />
        <DBTable
          columns={[
            { key: 'icon', icon: null, label: '', className: 'h-icon' },
            { key: 'name', icon: <Type size={8} />, label: '클라이언트', className: 'h-name' },
            { key: 'schedule', icon: <CalendarClock size={8} />, label: '예정', className: 'h-prop', width: 70 },
            { key: 'amount', icon: <Coins size={8} />, label: '금액', className: 'h-date', width: 50 },
          ]}
          rows={[
            {
              key: 'f1',
              className: 'fin',
              cells: [
                <div key="i" className="n-page-icon blue"><Building2 size={10} /></div>,
                <div key="t" className="db-title">아카데미</div>,
                <div key="p" className="db-prop"><span className="n-tag green">4/14 (월)</span></div>,
                <div key="d" className="db-date db-amount">200만</div>,
              ],
            },
            {
              key: 'f2',
              className: 'fin',
              cells: [
                <div key="i" className="n-page-icon gray"><Building2 size={10} /></div>,
                <div key="t" className="db-title">KCC정보통신</div>,
                <div key="p" className="db-prop"><span className="n-tag gray">예정일 미정</span></div>,
                <div key="d" className="db-date db-amount">150만</div>,
              ],
            },
            {
              key: 'f3',
              className: 'fin',
              cells: [
                <div key="i" className="n-page-icon purple"><Building2 size={10} /></div>,
                <div key="t" className="db-title">젠스파크</div>,
                <div key="p" className="db-prop"><span className="n-tag gray">예정일 미정</span></div>,
                <div key="d" className="db-date db-amount">110만</div>,
              ],
            },
            {
              key: 'f4',
              className: 'fin',
              cells: [
                <div key="i" className="n-page-icon orange"><Building2 size={10} /></div>,
                <div key="t" className="db-title">매직라이트</div>,
                <div key="p" className="db-prop"><span className="n-tag gray">예정일 미정</span></div>,
                <div key="d" className="db-date db-amount">70만</div>,
              ],
            },
          ]}
          variant="finance"
        />
      </section>

      {/* ============ ADD SECTION ============ */}
      <button className="add-section" onClick={() => setWidgetSheetOpen(true)}>
        <Plus size={10} /> 위젯 섹션 추가
      </button>

      {/* ============ WIDGET BOTTOM SHEET ============ */}
      <BottomSheet
        open={widgetSheetOpen}
        onClose={() => setWidgetSheetOpen(false)}
        title="위젯 추가"
      >
        <div className="bs-opt" onClick={() => handleWidgetSelect('숫자 카드')}>
          <div className="bs-icon" style={{ color: 'var(--n-blue-tx)' }}><Hash size={13} /></div>
          <div><div className="bs-name">숫자 카드</div><div className="bs-desc">단일 메트릭 (합계, D-day, 카운트)</div></div>
        </div>
        <div className="bs-opt" onClick={() => handleWidgetSelect('리스트')}>
          <div className="bs-icon" style={{ color: 'var(--n-green-tx)' }}><List size={13} /></div>
          <div><div className="bs-name">리스트</div><div className="bs-desc">체크박스 + 날짜 세로 목록</div></div>
        </div>
        <div className="bs-opt" onClick={() => handleWidgetSelect('카드 슬라이드')}>
          <div className="bs-icon" style={{ color: 'var(--n-purple-tx)' }}><Layers size={13} /></div>
          <div><div className="bs-name">카드 슬라이드</div><div className="bs-desc">가로 스와이프 썸네일 카드</div></div>
        </div>
        <div className="bs-opt" onClick={() => handleWidgetSelect('캘린더')}>
          <div className="bs-icon" style={{ color: 'var(--n-blue-tx)' }}><Calendar size={13} /></div>
          <div><div className="bs-name">캘린더</div><div className="bs-desc">월간 미니 캘린더 + 이벤트 도트</div></div>
        </div>
        <div className="bs-opt" onClick={() => handleWidgetSelect('갤러리')}>
          <div className="bs-icon" style={{ color: 'var(--n-orange-tx)' }}><Image size={13} /></div>
          <div><div className="bs-name">갤러리</div><div className="bs-desc">2~3열 이미지 그리드</div></div>
        </div>
        <div className="bs-opt" onClick={() => handleWidgetSelect('프로그레스')}>
          <div className="bs-icon" style={{ color: 'var(--n-green-tx)' }}><Activity size={13} /></div>
          <div><div className="bs-name">프로그레스</div><div className="bs-desc">원형/바 진행률 표시</div></div>
        </div>
        <div className="bs-opt" onClick={() => handleWidgetSelect('퀵 액션')}>
          <div className="bs-icon" style={{ color: 'var(--n-brown-tx)' }}><Zap size={13} /></div>
          <div><div className="bs-name">퀵 액션</div><div className="bs-desc">원터치 바로가기 버튼</div></div>
        </div>
      </BottomSheet>

      {/* ============ WIDGET ADDED TOAST ============ */}
      {widgetAddedMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--n-ink)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            padding: '9px 18px',
            borderRadius: 20,
            zIndex: 200,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
          위젯이 추가되었습니다
        </div>
      )}

      {/* ============ CONFIG BOTTOM SHEET ============ */}
      <BottomSheet
        open={configWidgetType !== null}
        onClose={handleConfigClose}
        title={configWidgetType ? `${configWidgetType} 설정` : ''}
      >
        {/* Back button rendered above the sheet content via absolute positioning workaround — injected as first child */}
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <button
            onClick={handleConfigBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--n-ink)',
              opacity: 0.5,
            }}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* DB 선택 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--n-ink)', opacity: 0.5, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            DB 선택
          </div>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setDbDropdownOpen(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                border: '1px solid var(--n-border)',
                borderRadius: 8,
                background: 'var(--n-surface)',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--n-ink)',
              }}
            >
              <span>{configDb}</span>
              <ChevronDown size={13} style={{ opacity: 0.5 }} />
            </div>
            {dbDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'var(--n-surface)',
                  border: '1px solid var(--n-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  zIndex: 10,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              >
                {DB_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    onClick={() => { setConfigDb(opt); setDbDropdownOpen(false); }}
                    style={{
                      padding: '9px 12px',
                      fontSize: 13,
                      cursor: 'pointer',
                      background: configDb === opt ? 'var(--n-blue-bg)' : 'transparent',
                      color: configDb === opt ? 'var(--n-blue-tx)' : 'var(--n-ink)',
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 사이즈 선택 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--n-ink)', opacity: 0.5, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            사이즈 선택
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {SIZE_OPTIONS.map(size => (
              <button
                key={size}
                onClick={() => setConfigSize(size)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: configSize === size ? '1.5px solid var(--n-blue-tx)' : '1px solid var(--n-border)',
                  borderRadius: 20,
                  background: configSize === size ? 'var(--n-blue-bg)' : 'var(--n-surface)',
                  color: configSize === size ? 'var(--n-blue-tx)' : 'var(--n-ink)',
                  fontSize: 13,
                  fontWeight: configSize === size ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 완료 버튼 */}
        <button
          onClick={handleWidgetAdd}
          style={{
            width: '100%',
            height: 44,
            background: 'var(--n-ink)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          위젯 추가
        </button>
      </BottomSheet>
    </>
  );
}
