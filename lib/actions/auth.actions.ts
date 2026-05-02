'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail, createLoopsContact } from '@/lib/loops/emails';
import type { Currency } from '@/types';

// ─── Check Username Available ──────────────────────────────────────────────

const RESERVED = new Set(['admin', 'kiima', 'support', 'help', 'api', 'www']);

export async function checkUsernameAvailable(
  username: string
): Promise<{ available: boolean; error?: string }> {
  const lower = username.toLowerCase().trim();

  if (lower.length < 3) return { available: false, error: 'At least 3 characters.' };
  if (lower.length > 30) return { available: false, error: 'Max 30 characters.' };
  if (!/^[a-z0-9_]+$/.test(lower)) return { available: false, error: 'Letters, numbers, and underscores only.' };
  if (RESERVED.has(lower)) return { available: false, error: 'This username is reserved.' };

  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', lower)
    .maybeSingle();

  return { available: !data };
}

// ─── Complete Google Onboarding ────────────────────────────────────────────

export interface OnboardingState {
  error?: string;
  fieldErrors?: Partial<Record<'username' | 'display_name', string>>;
  success?: boolean;
}

export async function completeGoogleOnboarding(data: {
  username: string;
  displayName: string;
  currency: Currency;
  avatarUrl: string | null;
}): Promise<OnboardingState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated — please sign in again.' };

  const username = data.username.toLowerCase().trim();
  const displayName = data.displayName.trim();

  const fieldErrors: NonNullable<OnboardingState['fieldErrors']> = {};

  if (!displayName) fieldErrors.display_name = 'Please enter your display name.';
  if (!username) {
    fieldErrors.username = 'Please choose a username.';
  } else if (username.length < 3) {
    fieldErrors.username = 'At least 3 characters.';
  } else if (!/^[a-z0-9_]+$/.test(username)) {
    fieldErrors.username = 'Letters, numbers, and underscores only.';
  } else if (RESERVED.has(username)) {
    fieldErrors.username = 'This username is reserved.';
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const admin = createAdminClient();
  const { error: profileError } = await admin.from('profiles').insert({
    id: user.id,
    username,
    display_name: displayName,
    currency: data.currency,
    avatar_url: data.avatarUrl ?? null,
  });

  if (profileError) {
    if (profileError.code === '23505') {
      return { fieldErrors: { username: 'This username is already taken.' } };
    }
    console.error('[completeGoogleOnboarding] insert error:', profileError.message);
    return { error: 'Something went wrong — try again.' };
  }

  // Fire welcome email + contact creation — never block onboarding
  const email     = user.email ?? '';
  const firstName = data.displayName.split(' ')[0];
  const lastName  = data.displayName.split(' ').slice(1).join(' ');
  if (email) {
    await Promise.allSettled([
      sendWelcomeEmail({ email, firstName, username }),
      createLoopsContact({ email, firstName, lastName, username, currency: data.currency }),
    ]);
  }

  return { success: true };
}

// ─── Signup ────────────────────────────────────────────────────────────────

export interface SignupState {
  error?: string;
  fieldErrors?: Partial<
    Record<'email' | 'password' | 'username' | 'display_name', string>
  >;
  emailConfirmationRequired?: boolean;
  success?: boolean;
}

export async function signupAction(
  _prevState: SignupState | null,
  formData: FormData
): Promise<SignupState> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';
  const username = (formData.get('username') as string | null)
    ?.toLowerCase()
    .trim() ?? '';
  const display_name =
    (formData.get('display_name') as string | null)?.trim() ?? '';
  const currency = ((formData.get('currency') as string | null) ??
    'NGN') as Currency;

  // Validation
  const fieldErrors: NonNullable<SignupState['fieldErrors']> = {};

  if (!display_name) {
    fieldErrors.display_name = 'Please enter your display name.';
  }
  if (!username) {
    fieldErrors.username = 'Please choose a username.';
  } else if (username.length < 3) {
    fieldErrors.username = 'Username must be at least 3 characters.';
  } else if (!/^[a-z0-9_-]+$/.test(username)) {
    fieldErrors.username =
      'Only lowercase letters, numbers, hyphens, and underscores.';
  }
  if (!email) {
    fieldErrors.email = 'Please enter your email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Please enter a valid email.';
  }
  if (!password) {
    fieldErrors.password = 'Please enter a password.';
  } else if (password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = createClient();

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (authError) {
    console.error('[signupAction] auth.signUp error:', {
      message: authError.message,
      status: authError.status,
      name: authError.name,
    });
    const msg = authError.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('already in use')) {
      return { fieldErrors: { email: 'An account with this email already exists.' } };
    }
    if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('after')) {
      return { error: 'Too many attempts — please wait a moment and try again.' };
    }
    if (msg.includes('password') || msg.includes('weak')) {
      return { fieldErrors: { password: 'Password is too weak — please choose a stronger one.' } };
    }
    if (msg.includes('confirmation email') || msg.includes('sending')) {
      return { error: 'Account created but confirmation email failed — please contact support or try signing in.' };
    }
    return { error: 'Something went wrong — try again.' };
  }

  if (!authData.user) {
    return { error: 'Something went wrong — try again.' };
  }

  const admin = createAdminClient();

  // 2. Insert the creator profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    username,
    display_name,
    currency,
  });

  if (profileError) {
    console.error('[signupAction] profiles insert error:', {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    });
    if (profileError.code === '23505') {
      const details = `${profileError.details ?? ''} ${profileError.message ?? ''}`.toLowerCase();
      if (details.includes('username')) {
        return { fieldErrors: { username: 'This username is already taken — try another.' } };
      }
      return { fieldErrors: { email: 'An account with this email already exists.' } };
    }
    return { error: 'Something went wrong — try again.' };
  }

  // Default "Buy me a drink 🥤" tag is inserted automatically by the
  // on_profile_created_insert_default_tag database trigger (migration 002).

  // Fire welcome email + contact creation — never block profile creation
  const firstName = display_name.split(' ')[0];
  const lastName  = display_name.split(' ').slice(1).join(' ');
  await Promise.allSettled([
    sendWelcomeEmail({ email, firstName, username }),
    createLoopsContact({ email, firstName, lastName, username, currency }),
  ]);

  // If Supabase email confirmation is enabled, there is no session yet.
  // The profile is created; the user must confirm their email to log in.
  if (!authData.session) {
    return { success: true, emailConfirmationRequired: true };
  }

  return { success: true };
}

// ─── Login ─────────────────────────────────────────────────────────────────


export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    return { error: 'Please enter your email and password.' };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Incorrect email or password — try again.' };
  }

  return { success: true };
}

// ─── Forgot Password ───────────────────────────────────────────────────────

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState | null,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';

  if (!email) {
    return { error: 'Please enter your email.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: 'Something went wrong — try again.' };
  }

  // Always return success to avoid email enumeration
  return { success: true };
}

// ─── Update Profile ────────────────────────────────────────────────────────

export interface UpdateProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prevState: UpdateProfileState | null,
  formData: FormData
): Promise<UpdateProfileState> {
  const userId       = (formData.get('user_id')     as string | null)?.trim() ?? '';
  const display_name = (formData.get('display_name') as string | null)?.trim() ?? '';
  const bio          = (formData.get('bio')          as string | null)?.trim() ?? '';
  const avatar_url   = (formData.get('avatar_url')   as string | null)?.trim() || null;

  if (!display_name) return { error: 'Display name cannot be empty.' };
  if (!userId)       return { error: 'Something went wrong — try again.' };

  const supabase = createClient();

  const updates: Record<string, unknown> = {
    display_name,
    bio: bio || null,
    ...(avatar_url ? { avatar_url } : {}),
  };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('[updateProfile] update error:', error.message);
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true };
}

// ─── Update Profile (direct — for edit-page sections) ─────────────────────────
// Unlike updateProfile (FormData), this accepts plain objects so each section
// on /dashboard/edit-page can save independently without a form submission.

export async function updateProfileDirect(
  userId: string,
  updates: {
    display_name?: string;
    bio?: string | null;
    avatar_url?: string | null;
    theme_color?: string;
  }
): Promise<{ success?: boolean; error?: string }> {
  if (!userId) return { error: 'Something went wrong — try again.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('[updateProfileDirect] error:', error.message);
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true };
}

// ─── Create Profile (email/password signup Step 3) ────────────────────────────

export async function createProfile(data: {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string | null;
  currency: Currency;
  socialLink?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const admin = createAdminClient();

  const { error } = await admin.from('profiles').insert({
    id: data.userId,
    username: data.username,
    display_name: data.displayName,
    bio: data.bio || null,
    avatar_url: data.avatarUrl || null,
    currency: data.currency,
  });

  if (error) {
    if (error.code === '23505') return { error: 'This username is already taken.' };
    console.error('[createProfile]', error.message);
    return { error: 'Something went wrong — try again.' };
  }

  if (data.socialLink) {
    await admin.from('social_links').insert({
      user_id: data.userId,
      platform: 'website',
      url: data.socialLink,
    });
  }

  const firstName = data.displayName.split(' ')[0];
  const lastName  = data.displayName.split(' ').slice(1).join(' ');
  await Promise.allSettled([
    sendWelcomeEmail({ email: data.email, firstName, username: data.username }),
    createLoopsContact({ email: data.email, firstName, lastName, username: data.username, currency: data.currency }),
  ]);

  return { success: true };
}

// ─── Upload Avatar (admin client — usable before email confirmation) ──────────

export async function uploadAvatar(
  userId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('avatar') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided.' };

  const admin = createAdminClient();
  const ext   = file.name.split('.').pop() ?? 'jpg';
  const path  = `${userId}/avatar.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error } = await admin.storage
    .from('avatars')
    .upload(path, Buffer.from(buffer), { contentType: file.type, upsert: true });

  if (error) {
    console.error('[uploadAvatar]', error.message);
    return { error: 'Upload failed — try again.' };
  }

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path);
  return { url: publicUrl };
}

// ─── Reset Password ────────────────────────────────────────────────────────

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState | null,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = (formData.get('password') as string | null) ?? '';
  const confirm = (formData.get('confirm') as string | null) ?? '';

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true };
}
