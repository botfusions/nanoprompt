import { supabase } from './supabase';

export const INITIAL_FREE_CREDITS = 3;
export const DAILY_REFILL_CREDITS = 2;

export const CREDIT_COSTS: Record<string, number> = {
  'flux-schnell': 1,
  'flux-pro': 3,
  'sdxl': 2,
};

export interface CreditBalance {
  credits: number;
  totalPurchased: number;
  totalUsed: number;
  lastFreeRefill: string | null;
}

export async function getOrCreateCreditBalance(userId: string): Promise<CreditBalance> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) {
    return {
      credits: data.credits,
      totalPurchased: data.total_purchased,
      totalUsed: data.total_used,
      lastFreeRefill: data.last_free_refill,
    };
  }

  if (error && error.code !== 'PGRST116') {
    console.error('Credit fetch error:', error.message);
  }

  const { data: newBalance, error: insertError } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      credits: INITIAL_FREE_CREDITS,
      total_purchased: 0,
      total_used: 0,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Credit create error:', insertError.message);
    return { credits: 0, totalPurchased: 0, totalUsed: 0, lastFreeRefill: null };
  }

  await logTransaction(userId, INITIAL_FREE_CREDITS, 'admin_grant', 'Hoş geldin bonusu');

  return {
    credits: newBalance.credits,
    totalPurchased: newBalance.total_purchased,
    totalUsed: newBalance.total_used,
    lastFreeRefill: newBalance.last_free_refill,
  };
}

export async function checkAndRefillDaily(userId: string): Promise<CreditBalance> {
  const balance = await getOrCreateCreditBalance(userId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  if (balance.lastFreeRefill && balance.lastFreeRefill >= todayStart) {
    return balance;
  }

  const { data, error } = await supabase
    .from('user_credits')
    .update({
      credits: balance.credits + DAILY_REFILL_CREDITS,
      last_free_refill: now.toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Daily refill error:', error.message);
    return balance;
  }

  await logTransaction(userId, DAILY_REFILL_CREDITS, 'daily_refill', 'Günlük ücretsiz kredi');

  return {
    credits: data.credits,
    totalPurchased: data.total_purchased,
    totalUsed: data.total_used,
    lastFreeRefill: data.last_free_refill,
  };
}

export async function deductCredits(
  userId: string,
  amount: number,
  referenceId?: string
): Promise<{ success: boolean; remaining: number }> {
  const balance = await getOrCreateCreditBalance(userId);

  if (balance.credits < amount) {
    return { success: false, remaining: balance.credits };
  }

  const newCredits = balance.credits - amount;
  const newUsed = balance.totalUsed + amount;

  const { error } = await supabase
    .from('user_credits')
    .update({ credits: newCredits, total_used: newUsed })
    .eq('user_id', userId);

  if (error) {
    console.error('Credit deduct error:', error.message);
    return { success: false, remaining: balance.credits };
  }

  await logTransaction(userId, -amount, 'generation', `Görsel oluşturma (${amount} kredi)`, referenceId);

  return { success: true, remaining: newCredits };
}

export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'admin_grant' | 'refund',
  description: string,
  referenceId?: string
): Promise<number> {
  const balance = await getOrCreateCreditBalance(userId);
  const newCredits = balance.credits + amount;
  const newPurchased = type === 'purchase' ? balance.totalPurchased + amount : balance.totalPurchased;

  const { error } = await supabase
    .from('user_credits')
    .update({ credits: newCredits, total_purchased: newPurchased })
    .eq('user_id', userId);

  if (error) {
    console.error('Credit add error:', error.message);
    return balance.credits;
  }

  await logTransaction(userId, amount, type, description, referenceId);

  return newCredits;
}

async function logTransaction(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
) {
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
    reference_id: referenceId || null,
  });
}
