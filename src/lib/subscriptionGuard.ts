import { prisma } from "@/lib/prisma";

export interface SubscriptionStatusResult {
  isLocked: boolean;
  isGrace: boolean;
  status: "ACTIVE" | "TRIAL" | "GRACE" | "LOCKED";
  validTill: Date;
  daysRemaining: number;
  message?: string;
}

export class SubscriptionLockedError extends Error {
  statusCode: number;
  code: string;

  constructor(message = "Subscription expired and grace period lapsed. Invoice creation is locked.") {
    super(message);
    this.name = "SubscriptionLockedError";
    this.statusCode = 403;
    this.code = "SUBSCRIPTION_LOCKED";
  }
}

/**
 * Pure function to evaluate subscription status from validTill date and status.
 */
export function checkSubscriptionStatusFromValidTill(validTill: Date, status: string = "ACTIVE"): SubscriptionStatusResult {
  const now = new Date();
  const gracePeriodEnd = new Date(validTill.getTime() + 3 * 24 * 60 * 60 * 1000); // validTill + 3 days

  const diffMs = validTill.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (now <= validTill) {
    return {
      isLocked: false,
      isGrace: false,
      status: status === "TRIAL" ? "TRIAL" : "ACTIVE",
      validTill,
      daysRemaining,
    };
  }

  if (now <= gracePeriodEnd) {
    const graceDaysLeft = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      isLocked: false,
      isGrace: true,
      status: "GRACE",
      validTill,
      daysRemaining: 0,
      message: `Subscription expired on ${validTill.toLocaleDateString()}. Grace period active (${graceDaysLeft} day(s) remaining). Please renew your subscription to avoid lockout.`,
    };
  }

  return {
    isLocked: true,
    isGrace: false,
    status: "LOCKED",
    validTill,
    daysRemaining: 0,
    message: "Subscription expired and 3-day grace period lapsed. Write access locked.",
  };
}

/**
 * Checks the subscription validity and grace period for a given tenant.
 * Grace period is defined as 3 days post validTill expiry.
 */
export async function checkSubscriptionStatus(tenantId: string): Promise<SubscriptionStatusResult> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { validTill: true, status: true },
  });

  if (!tenant) {
    throw new Error(`Tenant with ID '${tenantId}' not found.`);
  }

  return checkSubscriptionStatusFromValidTill(new Date(tenant.validTill), tenant.status);
}

/**
 * Enforces write-lockout for tenant write operations (e.g. POST /api/invoices/create).
 * Throws SubscriptionLockedError (HTTP 403) if subscription grace window has lapsed.
 */
export async function enforceSubscriptionLock(tenantId: string): Promise<void> {
  const result = await checkSubscriptionStatus(tenantId);
  if (result.isLocked) {
    throw new SubscriptionLockedError();
  }
}
