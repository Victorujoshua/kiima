interface Props {
  step: number;
  total: number;
}

export default function SignupProgressBar({ step, total }: Props) {
  const pct = (step / total) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 40 }}>
      <div style={{ width: 200, height: 4, background: '#e8e8e8', borderRadius: 100, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: '#D7D744',
            borderRadius: 100,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B5AAAA', margin: 0 }}>
        Step {step} of {total}
      </p>
    </div>
  );
}
