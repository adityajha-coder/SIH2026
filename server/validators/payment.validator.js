import { z } from "zod";

export const createOrderSchema = z.object({
  paymentId: z.string().trim().min(1, "Payment ID is required"),
});

export const paymentVerifySchema = z.object({
  paymentId: z.string().trim().min(1, "Payment ID is required"),
  razorpay_order_id: z.string().trim().min(1, "Razorpay order ID is required"),
  razorpay_payment_id: z.string().trim().min(1, "Razorpay payment ID is required"),
  razorpay_signature: z.string().trim().min(1, "Razorpay signature is required"),
});

export const webhookSchema = z.object({
  event: z.string().min(1),
  payload: z.object({}).passthrough().optional(),
});
