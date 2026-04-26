import { loops } from './client';

// ─── Template IDs ─────────────────────────────────────────────────────────────
// Replace these with the real IDs from your Loops dashboard after creating templates.

const TEMPLATE_IDS = {
  welcome:          'cmofrv2wv0nyu0j0l8q9q1tcz',
  giftReceived:     'cmofs17r92g9t0h2vd0qovigh',
  poolContribution: 'cmofsnhqs03ok0izsmvvqcxtc',
  poolGoalReached:  'cmofsq83u03tz0izsx3x3716e',
  confirmEmail:     'cmofsrz3o0q6c0j0leo1acjh2',
};

type EmailResult = { success: true } | { success: false; error: string };

// ─── Welcome email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(user: {
  email: string;
  firstName: string;
  username: string;
}): Promise<EmailResult> {
  if (!loops) {
    console.warn('[loops] LOOPS_API_KEY not set — skipping welcome email');
    return { success: false, error: 'Loops not configured' };
  }
  try {
    await loops.sendTransactionalEmail({
      transactionalId: TEMPLATE_IDS.welcome,
      email: user.email,
      dataVariables: {
        first_name:    user.firstName,
        username:      user.username,
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        gift_link:     `${process.env.NEXT_PUBLIC_APP_URL}/${user.username}`,
      },
    });
    return { success: true };
  } catch (err) {
    console.error('[loops] sendWelcomeEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

// ─── Gift received email ──────────────────────────────────────────────────────

export async function sendGiftReceivedEmail(data: {
  creatorEmail: string;
  creatorFirstName: string;
  senderName: string;
  giftAmount: string;
  tagUsed: string | null;
  notePreview: string | null;
  dashboardUrl: string;
}): Promise<EmailResult> {
  if (!loops) {
    console.warn('[loops] LOOPS_API_KEY not set — skipping gift received email');
    return { success: false, error: 'Loops not configured' };
  }
  try {
    await loops.sendTransactionalEmail({
      transactionalId: TEMPLATE_IDS.giftReceived,
      email: data.creatorEmail,
      dataVariables: {
        first_name:   data.creatorFirstName,
        sendername:   data.senderName,
        giftamount:   data.giftAmount,
        tagused:      data.tagUsed ?? '',
        notepreview:  data.notePreview ?? '',
        dashboard_url: data.dashboardUrl,
      },
    });
    return { success: true };
  } catch (err) {
    console.error('[loops] sendGiftReceivedEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

// ─── Pool contribution email ──────────────────────────────────────────────────

export async function sendPoolContributionEmail(data: {
  creatorEmail: string;
  creatorFirstName: string;
  senderName: string;
  giftAmount: string;
  poolTitle: string;
  poolRaised: string;
  poolGoal: string;
  poolPercent: number;
  poolUrl: string;
  isGoalReached: boolean;
}): Promise<EmailResult> {
  if (!loops) {
    console.warn('[loops] LOOPS_API_KEY not set — skipping pool contribution email');
    return { success: false, error: 'Loops not configured' };
  }
  const templateId = data.isGoalReached
    ? TEMPLATE_IDS.poolGoalReached
    : TEMPLATE_IDS.poolContribution;
  try {
    await loops.sendTransactionalEmail({
      transactionalId: templateId,
      email: data.creatorEmail,
      dataVariables: {
        first_name:   data.creatorFirstName,
        sender_name:  data.senderName,
        gift_amount:  data.giftAmount,
        pool_title:   data.poolTitle,
        pool_raised:  data.poolRaised,
        pool_goal:    data.poolGoal,
        pool_percent: data.poolPercent,
        pool_url:     data.poolUrl,
      },
    });
    return { success: true };
  } catch (err) {
    console.error('[loops] sendPoolContributionEmail failed:', err);
    return { success: false, error: String(err) };
  }
}

// ─── Create Loops contact ─────────────────────────────────────────────────────

export async function createLoopsContact(user: {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  currency: string;
}): Promise<EmailResult> {
  if (!loops) {
    console.warn('[loops] LOOPS_API_KEY not set — skipping contact creation');
    return { success: false, error: 'Loops not configured' };
  }
  try {
    await loops.createContact({
      email: user.email,
      properties: {
        firstName:       user.firstName,
        lastName:        user.lastName,
        userGroup:       'creators',
        source:          'kiima-signup',
        username:        user.username,
        currency:        user.currency,
        gift_count:      0,
        total_received:  0,
      },
    });
    return { success: true };
  } catch (err) {
    console.error('[loops] createLoopsContact failed:', err);
    return { success: false, error: String(err) };
  }
}
