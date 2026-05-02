export default function PoolsLoading() {
  return (
    <div>
      {/* Page header — matches pools/page.tsx headerStyle: flex, space-between, marginBottom 28 */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        gap:            16,
        marginBottom:   28,
        flexWrap:       'wrap',
      }}>
        <div>
          {/* Title — h1.k-dash-page-title */}
          <div className="shimmer" style={{ width: 140, height: 24, borderRadius: 6, marginBottom: 8 }} />
          {/* Subtitle */}
          <div className="shimmer" style={{ width: 280, height: 14, borderRadius: 6 }} />
        </div>
        {/* "Create pool" button — pill, ~130×44 */}
        <div className="shimmer" style={{ width: 130, height: 44, borderRadius: 100, flexShrink: 0 }} />
      </div>

      {/* Pool card list — matches listStyle: flex col, gap 16 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              background:    '#ffffff',
              borderRadius:  16,
              border:        '1px solid #EBEBEB',
              padding:       28,
              display:       'flex',
              flexDirection: 'column',
              gap:           16,
            }}
          >
            {/* Pool header: title + badge + URL — matches poolHeaderStyle children */}
            <div>
              {/* Title row — matches poolTitleRowStyle: flex, alignItems center, gap 8, marginBottom 4 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                {/* Pool title — 16px bold */}
                <div className="shimmer" style={{ flex: 1, maxWidth: 200, height: 18, borderRadius: 6 }} />
                {/* Status badge pill — matches badgeStyle: borderRadius 100, padding 3px 10px */}
                <div className="shimmer" style={{ width: 52, height: 22, borderRadius: 100, flexShrink: 0 }} />
              </div>
              {/* Pool URL — CopyPoolLink: 12px link */}
              <div className="shimmer" style={{ width: 220, height: 12, borderRadius: 6 }} />
            </div>

            {/* Progress bar — matches ProgressBar: full width, 8px height */}
            <div className="shimmer" style={{ width: '100%', height: 8, borderRadius: 100 }} />

            {/* Footer — matches poolFooterStyle: flex, space-between */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Raised label — 12px muted */}
              <div className="shimmer" style={{ width: 180, height: 12, borderRadius: 6 }} />
              {/* View → link — 13px */}
              <div className="shimmer" style={{ width: 40, height: 13, borderRadius: 6, flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
