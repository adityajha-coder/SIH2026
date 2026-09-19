import React from "react";
import { useStartupPayments } from "@/hooks/usePayments";
import { Card, CardContent } from "@/components/ui/card";

export function StartupPayments() {
  const { data = [], isLoading } = useStartupPayments();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-[#10233F]">Payment Received</h1>
      {isLoading ? (
        <p>Loading payments...</p>
      ) : (
        <div className="space-y-3">
          {data.map((payment) => (
            <Card key={payment._id} className="border-slate-200 bg-white">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Government</span>
                  <strong>{payment.metadata?.department || "Department of XYZ"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Project</span>
                  <strong>{payment.metadata?.projectName || "Digital Service Project"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <strong>₹{Number(payment.amount || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <strong>{payment.status}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification</span>
                  <strong>{payment.verificationStatus}</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default StartupPayments;
