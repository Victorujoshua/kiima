'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Currency } from '@/types';

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
  });

  if (authError) {
    console.error('[signupAction] auth.signUp error:', {
      message: authError.message,
      status: authError.status,
      name: authError.name,
    });
    if (authError.message.toLowerCase().includes('already registered')) {
      return {
        fieldErrors: {
          email: 'An account with this email already exists.',
        },
      };
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
      return {
        fieldErrors: { username: 'This username is already taken.' },
      };
    }
    return { error: 'Something went wrong — try again.' };
  }

  // Default "Buy me a drink 🥤" tag is inserted automatically by the
  // on_profile_created_insert_default_tag database trigger (migration 002).

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
