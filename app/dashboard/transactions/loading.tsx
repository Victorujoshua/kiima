export default function TransactionsLoading() {
  return (
    <div>
      {/* Page title — matches h1.k-dash-page-title */}
      <div className="shimmer" style={{ width: 100, height: 24, borderRadius: 6, marginBottom: 24 }} />

      {/* Toolbar — matches toolbarStyle: flex, gap 12, marginBottom 20 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search bar shell — matches searchWrapStyle exactly */}
        <div style={{
          flex:         1,
          minWidth:     200,
          height:       44,
          background:   '#ffffff',
          border:       '1px solid #EBEBEB',
          borderRadius: 12,
          padding:      '0 14px',
          display:      'flex',
          alignItems:   'center',
          boxSizing:    'border-box',
        }}>
          <div className="shimmer" style={{ flex: 1, height: 16, borderRadius: 6 }} />
        </div>

        {/* Filter button shell — matches filterBtnStyle: height 44, borderRadius 100 */}
        <div style={{
          height:       44,
          padding:      '0 18px',
          border:       '1px solid #EBEBEB',
          borderRadius: 100,
          background:   '#ffffff',
          display:      'flex',
          alignItems:   'center',
          boxSizing:    'border-box',
        }}>
          <div className="shimmer" style={{ width: 90, height: 14, borderRadius: 6 }} />
        </div>
      </div>

      {/* Results card — matches cardStyle exactly */}
      <div style={{
        background:   '#ffffff',
        borderRadius: 16,
        border:       '1px solid #EBEBEB',
        padding:      28,
      }}>
        {/* Count label — matches countStyle: 11px uppercase, margin 0 0 16px */}
        <div className="shimmer" style={{ width: 130, height: 11, borderRadius: 6, marginBottom: 16 }} />

        {/* 8 contribution rows — each matches ContributionRow rowStyle: padding 8px 0, flex space-between */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const isLast = i === 7;
          return (
            <div
              key={i}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                gap:            16,
                padding:        '8px 0',
                borderBottom:   isLast ? 'none' : '1px solid rgba(28,25,22,0.06)',
              }}
            >
              {/* Left: line text (14px) + source badge (11px) */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="shimmer" style={{ width: `${55 + (i * 7) % 30}%`, height: 14, borderRadius: 6 }} />
                <div className="shimmer" style={{ width: 60, height: 11, borderRadius: 6, marginTop: 2 }} />
              </div>
              {/* Right: date — matches dateStyle: 12px, flexShrink 0 */}
              <div className="shimmer" style={{ width: 72, height: 12, borderRadius: 6, flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
