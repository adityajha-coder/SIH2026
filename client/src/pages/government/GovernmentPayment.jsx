import React from "react";
import { Link } from "react-router-dom";
import { useGovernmentPayments } from "@/hooks/usePayments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GovernmentPayment() {
  const { data = [], isLoading } = useGovernmentPayments();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#10233F]">Payment History</h1>
      </div>

      {isLoading ? (
        <p>Loading payments...</p>
      ) : (
        <div className="space-y-3">
          {data.map((payment) => (
            <Card key={payment._id} className="border-slate-200">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{payment.metadata?.startupName || "Startup"}</div>
                  <div className="text-sm text-slate-500">{payment.metadata?.projectName || "Project"}</div>
                  <div className="text-sm text-slate-500">₹{Number(payment.amount || 0).toLocaleString("en-IN")}</div>
                </div>
                <Link to={`/government/payments/${payment._id}`}>
                  <Button variant="outline" size="sm">Open</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default GovernmentPayment;
