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

const DB_OPTIONS = ['Beyond_Tasks', '타임라인(가계부)', '예정 수입/지출', 'Insights', 'Works'];
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];

export default function HomePage() {
  const [widgetSheetOpen, setWidgetSheetOpen] = useState(false);
  const [configWidgetType, setConfigWidgetType] = useState<string | null>(null);
  const [configDb, setConfigDb] = useState(DB_OPTIONS[0]);
  const [configSize, setConfigSize] = useState('Medium');
  const [dbDropdownOpen, setDbDropdownOpen] = useState(false);

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
    console.log({ type: configWidgetType, db: configDb, size: configSize });
    handleConfigClose();
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
        <div className="metric-strip">
          <MetricCard
            accent="#2a9d99"
            icon={<ArrowDownToLine size={11} />}
            iconColor="teal"
            label="예정 수입"
            value={530}
            unit="만원"
            valueColor="teal"
            sub={<><ArrowUpRight size={8} /> 4건 대기</>}
          />
          <MetricCard
            accent="var(--n-red-tx)"
            icon={<Timer size={11} />}
            iconColor="red"
            label="D-Day"
            value={3}
            unit="일"
            valueColor="red"
            sub={<><Flag size={8} /> 매직라이트 게시</>}
          />
          <MetricCard
            accent="var(--n-orange-tx)"
            icon={<AlertCircle size={11} />}
            iconColor="orange"
            label="미완료"
            value={2}
            unit="건"
            valueColor="orange"
            sub={<><Clock3 size={8} /> 마감 지연</>}
          />
        </div>
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
        />
        <div className="rail">
          <SlideCard
            coverGradient="linear-gradient(135deg, #ebe4f7, #d4c6ec)"
            coverTag="AI"
            coverTagColor="var(--n-purple-tx)"
            title="Google Gemma 4 출시 분석"
            desc="Apache 2.0 라이선스, OpenClaw 공식 지원 확정. MoE 26B 활성 파라미터 3.8B로 에이전트 최적화."
            tags={[
              { label: '오픈소스', className: 'n-tag purple' },
              { label: '4/5', className: 'n-tag gray' },
            ]}
          />
          <SlideCard
            coverGradient="linear-gradient(135deg, #fde8e8, #f5c4c4)"
            coverTag="Policy"
            coverTagColor="var(--n-red-tx)"
            title="Anthropic 4/4 정책 변경"
            desc="Claude Pro/Max 구독 third-party 에이전트 차단. API 키 또는 Extra Usage 과금 전환."
            tags={[
              { label: '긴급', className: 'n-tag red' },
              { label: '4/4', className: 'n-tag gray' },
            ]}
          />
          <SlideCard
            coverGradient="linear-gradient(135deg, #e1eef8, #b8d4f0)"
            coverTag="Design"
            coverTagColor="var(--n-blue-tx)"
            title="awesome-design-md 35K stars"
            desc="10일 만에 GitHub 역대 최속 awesome 리스트. DESIGN.md 컨벤션이 새 표준으로 부상."
            tags={[
              { label: '트렌드', className: 'n-tag blue' },
              { label: '4/9', className: 'n-tag gray' },
            ]}
          />
        </div>
      </section>

      {/* ============ 웍스 ============ */}
      <section className="w-section anim a5">
        <SectionHead
          icon={<Briefcase size={10} style={{ color: 'var(--n-blue-tx)' }} />}
          iconColor="var(--n-blue-tx)"
          title="웍스"
          moreLabel="더보기"
        />
        <div className="rail">
          <SlideCard
            coverGradient="linear-gradient(135deg, #e1eef8, #cde0f5)"
            coverTag="기획"
            coverTagColor="var(--n-blue-tx)"
            title="세븐플러스 K-art 기획안"
            desc="기획 방향 1차 검토 완료. 피드백 반영 중."
            tags={[{ label: '완료', className: 'n-status done' }]}
          />
          <SlideCard
            coverGradient="linear-gradient(135deg, #fef0e4, #f5d9b8)"
            coverTag="Video"
            coverTagColor="var(--n-orange-tx)"
            title="Magiclight 영상 대본"
            desc="초안 전달 완료. 최종 게시 4/14~15 예정."
            tags={[{ label: '진행중', className: 'n-status progress' }]}
          />
          <SlideCard
            coverGradient="linear-gradient(135deg, #e6f5f4, #b8e0de)"
            coverTag="강의"
            coverTagColor="var(--n-green-tx)"
            title="해커스 바이브코딩 커리큘럼"
            desc="2차시 수정본 작업 중. 피봇 관련 논의 필요."
            tags={[{ label: '진행중', className: 'n-status progress' }]}
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
