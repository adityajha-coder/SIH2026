import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ensureRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window not available"));
    if (window.Razorpay) return resolve(window.Razorpay);

    const existing = document.querySelector("script[data-razorpay='true']");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Razorpay), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export function PaymentPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["payment", paymentId],
    enabled: Boolean(paymentId),
    queryFn: async () => {
      const res = await apiClient.get(`/payments/${paymentId}`);
      return res?.data || null;
    },
  });

  const payment = data || {};

  const amountDisplay = useMemo(() => {
    return Number(payment.amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  }, [payment.amount]);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/payments/create-order", { paymentId });
      return res?.data || null;
    },
  });

  const handleProceed = async () => {
    try {
      setIsProcessing(true);
      const orderData = await createOrderMutation.mutateAsync();
      const key = orderData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      const options = {
        key,
        amount: orderData?.amount,
        currency: orderData?.currency || "INR",
        name: "Pragati-GovX",
        description: `Payment for ${payment.metadata?.projectName || "Digital Service Project"}`,
        order_id: orderData?.orderId,
        handler: async function (response) {
          try {
            await apiClient.post("/payments/verify", {
              paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment verified successfully.");
            navigate("/government/dashboard");
          } catch (error) {
            toast.error(error.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: "Government Officer",
        },
        theme: { color: "#2563EB" },
        modal: {
          ondismiss: () => {
            toast.warning("Checkout was closed before completion.");
          },
        },
      };

      const RazorpayCtor = await ensureRazorpayScript();
      const rzp = new RazorpayCtor(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message || "Unable to start payment flow.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-[#10233F]">Government Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Startup</p>
              <p className="font-semibold">{payment.metadata?.startupName || "ABC Technologies Pvt. Ltd."}</p>
            </div>
            <div>
              <p className="text-slate-500">Project</p>
              <p className="font-semibold">{payment.metadata?.projectName || "Digital Service Project"}</p>
            </div>
            <div>
              <p className="text-slate-500">Government Department</p>
              <p className="font-semibold">{payment.metadata?.department || "Department of XYZ"}</p>
            </div>
            <div>
              <p className="text-slate-500">Transaction Reference</p>
              <p className="font-semibold">{payment.governmentReferenceId || "GOV-STP-2026-001"}</p>
            </div>
            <div>
              <p className="text-slate-500">Approved Amount</p>
              <p className="font-semibold text-lg">₹{amountDisplay}</p>
            </div>
            <div>
              <p className="text-slate-500">Payment Status</p>
              <p className="font-semibold">{payment.status || "PENDING"}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleProceed}
              disabled={isProcessing || createOrderMutation.isPending}
              className="bg-[#2563EB] hover:bg-blue-600 text-white"
            >
              {isProcessing || createOrderMutation.isPending ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentPage;
