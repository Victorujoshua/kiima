export default function DashboardLoading() {
  return (
    <div>
      {/* ── ProfileCard skeleton ─────────────────────────── */}
      {/* Outer shell matches DashboardProfileCard cardStyle exactly */}
      <div style={{
        background:   '#ffffff',
        borderRadius: 16,
        border:       '1px solid #EBEBEB',
        padding:      28,
        display:      'flex',
        alignItems:   'center',
        gap:          16,
      }}>
        {/* Avatar — 56×56 circle, matches avatarStyle */}
        <div className="shimmer" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />

        {/* Info column — flex:1 matches real info div */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name line — 16px text, ~160px wide */}
          <div className="shimmer" style={{ width: 160, height: 18 }} />
          {/* username row: text + copy icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <div className="shimmer" style={{ width: 120, height: 14 }} />
            <div className="shimmer" style={{ width: 14, height: 14, borderRadius: '50%' }} />
          </div>
          {/* Bio — 13px text, ~200px wide */}
          <div className="shimmer" style={{ width: 200, height: 12, marginTop: 8 }} />
        </div>

        {/* Share button — pill shape matches shareBtnStyle padding 10px 20px */}
        <div className="shimmer" style={{ width: 110, height: 36, borderRadius: 100, flexShrink: 0 }} />
      </div>

      {/* ── EarningsCard skeleton ────────────────────────── */}
      {/* Outer shell matches EarningsCard cardStyle exactly */}
      <div style={{
        background:   '#ffffff',
        borderRadius: 16,
        border:       '1px solid #EBEBEB',
        padding:      28,
        marginTop:    16,
      }}>
        {/* Header row — matches headerRowStyle: space-between, marginBottom 20 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* "Earnings" label — 18px bold */}
          <div className="shimmer" style={{ width: 80, height: 18 }} />
          {/* Period selector pill — borderRadius 100 matches periodSelectStyle */}
          <div className="shimmer" style={{ width: 120, height: 32, borderRadius: 100 }} />
        </div>

        {/* Big amount — 48px Fraunces, margin '0 0 20px' matches bigAmountStyle */}
        <div className="shimmer" style={{ width: 220, height: 56, borderRadius: 8, marginBottom: 20 }} />

        {/* Breakdown row — matches breakdownRowStyle: flex, gap 24 */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Colour dot — 8×8 circle, matches dotStyle */}
              <div className="shimmer" style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
              {/* Amount + label — single shimmer block */}
              <div className="shimmer" style={{ width: 80, height: 14 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── RecentGifts skeleton ─────────────────────────── */}
      {/* Outer shell matches RecentGifts cardStyle exactly */}
      <div style={{
        background:   '#ffffff',
        borderRadius: 16,
        border:       '1px solid #EBEBEB',
        padding:      28,
        marginTop:    16,
      }}>
        {/* Header — matches headerStyle: space-between, marginBottom 20 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* "Recent supporters" — 16px bold */}
          <div className="shimmer" style={{ width: 150, height: 18 }} />
          {/* "See all →" — 13px */}
          <div className="shimmer" style={{ width: 60, height: 14 }} />
        </div>

        {/* 5 rows — each matches the real contribution row layout exactly */}
        {[0, 1, 2, 3, 4].map(i => {
          const isLast = i === 4;
          return (
            <div
              key={i}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           12,
                paddingBottom: isLast ? 0 : 14,
                marginBottom:  isLast ? 0 : 14,
                borderBottom:  isLast ? 'none' : '1px solid #F2EDE7',
              }}
            >
              {/* Avatar — 38×38 circle, matches real avatar div */}
              <div className="shimmer" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />

              {/* Name + tag — flex:1, matches real middle column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name — 14px bold */}
                <div className="shimmer" style={{ width: 100, height: 14 }} />
                {/* Tag label — 12px, margin-top 2px matches tagStyle.margin */}
                <div className="shimmer" style={{ width: 80, height: 12, marginTop: 2 }} />
              </div>

              {/* Amount + time — flex column, gap 2 matches real right column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                {/* Amount — 14px bold */}
                <div className="shimmer" style={{ width: 70, height: 14 }} />
                {/* Time — 12px muted */}
                <div className="shimmer" style={{ width: 30, height: 12 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
