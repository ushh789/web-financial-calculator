import { z } from "zod";

export const interestConfigSchema = z.object({
  method: z.enum(["SIMPLE", "COMPOUND"]),
  dayCountConvention: z.enum([
    "ACTUAL_365",
    "ACTUAL_360",
    "THIRTY_360",
    "ACTUAL_ACTUAL",
  ]),
  rateType: z.enum(["FIXED", "FLOATING"]),
  accrualFrequency: z
    .enum([
      "ONCE",
      "DAILY",
      "WEEKLY",
      "BI_WEEKLY",
      "MONTHLY",
      "QUARTERLY",
      "SEMI_ANNUALLY",
      "ANNUALLY",
    ])
    .optional(),
  compoundingFrequency: z
    .enum([
      "ONCE",
      "DAILY",
      "WEEKLY",
      "BI_WEEKLY",
      "MONTHLY",
      "QUARTERLY",
      "SEMI_ANNUALLY",
      "ANNUALLY",
    ])
    .optional(),
});

export const repaymentConfigSchema = z.object({
  strategy: z.enum(["ANNUITY", "LINEAR", "BULLET", "ZERO_COUPON"]),
  frequency: z.enum([
    "ONCE",
    "DAILY",
    "WEEKLY",
    "BI_WEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "SEMI_ANNUALLY",
    "ANNUALLY",
  ]),
});

export const constraintsSchema = z.object({
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  minTerm: z.coerce.number().int().optional(),
  maxTerm: z.coerce.number().int().optional(),
  minRate: z.coerce.number().optional(),
  maxRate: z.coerce.number().optional(),
});

export const defaultsSchema = z.object({
  fixedRate: z.coerce.number().optional(),
  currency: z.enum(["USD", "EUR", "UAH", "GBP"]),
  roundingScale: z.coerce.number().int().default(2),
  roundingMode: z
    .enum(["UP", "DOWN", "CEILING", "FLOOR", "HALF_UP", "HALF_DOWN", "HALF_EVEN", "UNNECESSARY"])
    .default("HALF_UP"),
});

export const algorithmMetadataSchema = z.object({
  type: z.enum(["LOAN", "DEPOSIT"]),
  interest: interestConfigSchema,
  repayment: repaymentConfigSchema,
  constraints: constraintsSchema.optional(),
  defaults: defaultsSchema.optional(),
});

export const createCalculatorSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  algorithmMetadata: algorithmMetadataSchema,
});

export const createVersionSchema = z.object({
  algorithmMetadata: algorithmMetadataSchema,
});

export type CreateCalculatorFormValues = z.infer<typeof createCalculatorSchema>;
export type CreateVersionFormValues = z.infer<typeof createVersionSchema>;
