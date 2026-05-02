'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AvatarSection             from '@/components/dashboard/edit/AvatarSection';
import DisplayNameSection        from '@/components/dashboard/edit/DisplayNameSection';
import GiftLabelSection          from '@/components/dashboard/edit/GiftLabelSection';
import ThemeColorSection         from '@/components/dashboard/edit/ThemeColorSection';
import ShowContributionsSection  from '@/components/dashboard/edit/ShowContributionsSection';
import LivePreviewPanel          from '@/components/dashboard/edit/LivePreviewPanel';
import type { Currency } from '@/types';

// Tiptap uses browser APIs — must be loaded client-side only
const AboutSection = dynamic(
  () => import('@/components/dashboard/edit/AboutSection'),
  { ssr: false, loading: () => <div style={editorSkeletonStyle} /> }
);

interface Props {
  userId: string;
  username: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  initialThemeColor: string;
  initialTagLabel: string;
  initialTagAmount: number;
  initialShowContributions: boolean;
  currency: Currency;
}

export default function EditPageClient({
  userId,
  username,
  initialDisplayName,
  initialAvatarUrl,
  initialBio,
  initialThemeColor,
  initialTagLabel,
  initialTagAmount,
  initialShowContributions,
  currency,
}: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(initialAvatarUrl);
  const [bio, setBio]                 = useState<string | null>(initialBio);
  const [themeColor, setThemeColor]   = useState(initialThemeColor);
  const [tagLabel, setTagLabel]       = useState(initialTagLabel);

  return (
    <>
      {/* Page header */}
      <div style={pageHeaderStyle}>
        <h1 className="k-dash-page-title">Edit page</h1>
        <p style={subtitleStyle}>Changes are reflected live on your gift page</p>
      </div>

      <div style={layoutStyle}>
        {/* Edit sections column */}
        <div style={sectionsColStyle}>
          <AvatarSection
            userId={userId}
            initialAvatarUrl={initialAvatarUrl}
            displayName={displayName}
            onChange={url => setAvatarUrl(url)}
          />

          <DisplayNameSection
            userId={userId}
            initialValue={initialDisplayName}
            onChange={name => setDisplayName(name)}
          />

          <AboutSection
            userId={userId}
            initialBio={initialBio}
            onChange={html => setBio(html)}
          />

          <GiftLabelSection
            userId={userId}
            currency={currency}
            initialLabel={initialTagLabel}
            initialAmount={initialTagAmount}
            onChange={(label) => setTagLabel(label)}
          />

          <ThemeColorSection
            userId={userId}
            initialColor={initialThemeColor}
            onChange={color => setThemeColor(color)}
          />

          <ShowContributionsSection
            userId={userId}
            initialValue={initialShowContributions}
          />
        </div>

        {/* Live preview — desktop only */}
        <div className="k-edit-preview-col">
          <LivePreviewPanel
            displayName={displayName}
            username={username}
            avatarUrl={avatarUrl}
            bio={bio}
            themeColor={themeColor}
            tagLabel={tagLabel}
          />
        </div>
      </div>
    </>
  );
}

const pageHeaderStyle: React.CSSProperties = {
  marginBottom: 24,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#9A9089',
  margin: '4px 0 0',
};

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  gap: 32,
  alignItems: 'flex-start',
};

const sectionsColStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const editorSkeletonStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
  minHeight: 120,
};
