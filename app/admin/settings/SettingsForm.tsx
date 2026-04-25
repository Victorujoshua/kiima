'use client';

import { useState } from 'react';
import { updatePlatformSettings } from '@/lib/actions/admin.actions';
import type { PlatformSettings } from '@/types';

interface Props {
  settings: PlatformSettings;
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  width: '100%',
  maxWidth: 200,
  boxSizing: 'border-box',
};

export default function SettingsForm({ settings }: Props) {
  const [ngnAmount, setNgnAmount] = useState(String(settings.default_tag_amount_ngn));
  const [usdAmount, setUsdAmount] = useState(String(settings.default_tag_amount_usd));
  const [gbpAmount, setGbpAmount] = useState(String(settings.default_tag_amount_gbp));
  const [eurAmount, setEurAmount] = useState(String(settings.default_tag_amount_eur));
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenance_mode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const ngn = parseFloat(ngnAmount);
    const usd = parseFloat(usdAmount);
    const gbp = parseFloat(gbpAmount);
    const eur = parseFloat(eurAmount);

    if ([ngn, usd, gbp, eur].some((v) => isNaN(v) || v <= 0)) {
      setError('All tag amounts must be positive numbers.');
      return;
    }

    setSaving(true);
    const result = await updatePlatformSettings({
      default_tag_amount_ngn: ngn,
      default_tag_amount_usd: usd,
      default_tag_amount_gbp: gbp,
      default_tag_amount_eur: eur,
      maintenance_mode: maintenanceMode,
    });
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Default tag amounts */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: '0 0 4px',
          }}
        >
          Default "Buy me a drink 🥤" tag amounts
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            margin: '0 0 24px',
          }}
        >
          These amounts are used when a new creator signs up. Existing tags are not affected.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
          }}
        >
          {[
            { label: 'NGN (₦)', value: ngnAmount, onChange: setNgnAmount },
            { label: 'USD ($)', value: usdAmount, onChange: setUsdAmount },
            { label: 'GBP (£)', value: gbpAmount, onChange: setGbpAmount },
            { label: 'EUR (€)', value: eurAmount, onChange: setEurAmount },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance mode */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: '0 0 4px',
              }}
            >
              Maintenance mode
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                margin: 0,
              }}
            >
              When on, public gift pages and pool pages show an unavailable message.
              Creator dashboards and admin remain accessible.
            </p>
          </div>
          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={maintenanceMode}
            onClick={() => setMaintenanceMode((v) => !v)}
            style={{
              flexShrink: 0,
              marginLeft: 24,
              width: 44,
              height: 24,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: maintenanceMode ? 'var(--color-danger)' : 'rgba(28,25,22,0.15)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: maintenanceMode ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
        {maintenanceMode && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'var(--color-danger-soft)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-danger)',
            }}
          >
            Maintenance mode is ON — public pages are currently unavailable.
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: 'var(--color-danger-soft)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-danger)',
          }}
        >
          {error}
        </div>
      )}

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--color-text-primary)',
            color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-success)',
              fontWeight: 600,
            }}
          >
            Saved ✓
          </span>
        )}
      </div>
    </form>
  );
}
