export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-2xl)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
          padding: "var(--space-xl)",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {/* Label */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-text-faint)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Design system check
        </p>

        {/* Display heading */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "28px",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          Welcome to Kiima
        </h1>

        {/* Body copy */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: 1.65,
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-lg)",
          }}
        >
          A soft, modern digital space where giving feels natural. Fonts, tokens, and
          card system are loading correctly if you see this card.
        </p>

        {/* Accent pill */}
        <span
          style={{
            display: "inline-block",
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            borderRadius: "var(--radius-full)",
            padding: "6px var(--space-md)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          Buy me a coffee ☕
        </span>
      </div>
    </main>
  );
}
