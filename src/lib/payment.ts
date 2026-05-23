import crypto from 'crypto';

export const CREDIT_PACKAGES = [
  { id: 'starter', credits: 10, price: 99.90, label: 'Başlangıç', popular: false },
  { id: 'pro', credits: 50, price: 349.90, label: 'Pro', popular: true },
  { id: 'ultimate', credits: 200, price: 999.90, label: 'Sınırsız', popular: false },
] as const;

export type PackageId = (typeof CREDIT_PACKAGES)[number]['id'];

export function getPackageById(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

function getPayTRCredentials() {
  return {
    merchantId: process.env.PAYTR_MERCHANT_ID || '',
    merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
    merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
  };
}

export async function createPayTRPayment(
  userId: string,
  email: string,
  packageId: PackageId,
  userIp: string
): Promise<{ token: string; paymentUrl: string }> {
  const pkg = getPackageById(packageId);
  if (!pkg) throw new Error('Invalid package');

  const { merchantId, merchantKey, merchantSalt } = getPayTRCredentials();

  const merchantOid = `credits_${userId}_${Date.now()}`;
  const paymentAmount = Math.round(pkg.price * 100); // Kuruş
  const paymentType = '1';
  const installmentCount = '0';
  const currency = 'TL';
  const testMode = process.env.NODE_ENV === 'development' ? '1' : '0';

  const userEmail = email || 'noemail@imageprompt.studio';
  const userName = email?.split('@')[0] || 'Kullanıcı';

  const hashStr = [
    merchantId,
    userIp,
    merchantOid,
    userEmail,
    paymentAmount,
    paymentType,
    installmentCount,
    currency,
    testMode,
    merchantSalt,
  ].join('') + merchantKey;

  const paytrToken = crypto
    .createHash('sha256')
    .update(hashStr)
    .digest('base64');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const formData = new URLSearchParams();
  formData.append('merchant_id', merchantId);
  formData.append('user_ip', userIp);
  formData.append('merchant_oid', merchantOid);
  formData.append('email', userEmail);
  formData.append('payment_amount', String(paymentAmount));
  formData.append('paytr_token', paytrToken);
  formData.append('user_basket', JSON.stringify([
    [`${pkg.label} Kredi Paketi`, String(pkg.price), '1'],
  ]));
  formData.append('debug_on', testMode);
  formData.append('no_installment', '0');
  formData.append('max_installment', '0');
  formData.append('user_name', userName);
  formData.append('user_address', 'Türkiye');
  formData.append('user_phone', '0000000000');
  formData.append('merchant_ok_url', `${baseUrl}/generate?success=true`);
  formData.append('merchant_fail_url', `${baseUrl}/generate?canceled=true`);
  formData.append('timeout_limit', '30');
  formData.append('currency', currency);
  formData.append('test_mode', testMode);

  const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const result = await response.json();

  if (result.status === 'success') {
    return {
      token: result.token,
      paymentUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
    };
  }

  throw new Error(result.reason || 'PayTR token alınamadı');
}

export function verifyPayTRCallback(
  body: Record<string, string>
): { valid: boolean; merchantOid: string; status: string } {
  const { merchantId, merchantKey, merchantSalt } = getPayTRCredentials();

  const hashStr = [
    body.merchant_oid,
    merchantSalt,
    body.status,
    body.total_amount,
  ].join('') + merchantKey;

  const computedHash = crypto
    .createHash('sha256')
    .update(hashStr)
    .digest('base64');

  if (computedHash !== body.hash) {
    return { valid: false, merchantOid: body.merchant_oid, status: 'invalid' };
  }

  return {
    valid: true,
    merchantOid: body.merchant_oid,
    status: body.status,
  };
}
