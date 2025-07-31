import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button";
import { CheckCircle, CreditCard, Crown, Sparkles } from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore";

interface PaymentPlan {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  plan_type: string;
}

interface PaymentPlansProps {
  onPlanSelect?: (plan: PaymentPlan) => void;
}

const PaymentPlans: React.FC<PaymentPlansProps> = ({ onPlanSelect }) => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { apiConfig } = useFloorPlanStore();

  useEffect(() => {
    loadPlans();
    loadSubscriptionStatus();
  }, []);

  const loadPlans = async () => {
    if (!apiConfig?.baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/floorplans/payment_plans/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load payment plans");
      }

      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    if (!apiConfig?.baseUrl) return;

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/floorplans/subscription_status/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data);
      }
    } catch (err) {
      console.error("Failed to load subscription status:", err);
    }
  };

  const handlePlanSelect = async (plan: PaymentPlan) => {
    if (!apiConfig?.baseUrl) return;

    if (plan.price === 0) {
      // Free plan - no payment needed
      if (onPlanSelect) {
        onPlanSelect(plan);
      }
      return;
    }

    setSelectedPlan(plan.slug);
    setProcessingPayment(true);

    try {
      // Create payment order
      const orderResponse = await fetch(
        `${apiConfig.baseUrl}/api/floorplans/create_payment_order/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            plan_slug: plan.slug,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_your_key_here", // Replace with actual key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HomeDecor FloorPlanner",
        description: orderData.plan_name,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          await verifyPayment(orderData.payment_id, response);
        },
        prefill: {
          email: "user@example.com", // Get from user data
        },
        theme: {
          color: "#3B82F6",
        },
      };

      // @ts-ignore - Razorpay global
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  const verifyPayment = async (paymentId: number, razorpayResponse: any) => {
    if (!apiConfig?.baseUrl) return;

    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/api/floorplans/verify_payment/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            payment_id: paymentId,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Payment successful! ${data.plan_name} activated.`);
        await loadSubscriptionStatus(); // Refresh subscription status
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment verification failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment verification failed");
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "basic":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "premium":
        return <Crown className="h-6 w-6 text-blue-500" />;
      case "professional":
        return <Sparkles className="h-6 w-6 text-purple-500" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-500" />;
    }
  };

  const isCurrentPlan = (planType: string) => {
    return currentSubscription?.plan_type === planType;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading plans...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadPlans}
              className="ml-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your FloorPlanner Plan
        </h2>
        {currentSubscription && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              Current: {currentSubscription.plan_name}
            </Badge>
            {currentSubscription.expiry_date && (
              <span className="text-sm text-gray-500">
                Expires:{" "}
                {new Date(currentSubscription.expiry_date).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-200 hover:shadow-lg ${
              isCurrentPlan(plan.plan_type)
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:shadow-md"
            }`}
          >
            {isCurrentPlan(plan.plan_type) && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Current Plan
              </Badge>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.plan_type)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {plan.price === 0 ? (
                  "Free"
                ) : (
                  <>
                    ₹{plan.price}
                    <span className="text-base font-normal text-gray-500">
                      /{plan.duration_days} days
                    </span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={
                  isCurrentPlan(plan.plan_type) ? "secondary" : "default"
                }
                disabled={
                  isCurrentPlan(plan.plan_type) ||
                  processingPayment ||
                  selectedPlan === plan.slug
                }
                onClick={() => handlePlanSelect(plan)}
              >
                {isCurrentPlan(plan.plan_type)
                  ? "Current Plan"
                  : selectedPlan === plan.slug
                  ? "Processing..."
                  : plan.price === 0
                  ? "Select Free Plan"
                  : "Upgrade Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentSubscription && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
                <p className="text-gray-600">{currentSubscription.plan_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <Badge
                  variant={
                    currentSubscription.is_active ? "default" : "secondary"
                  }
                >
                  {currentSubscription.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentPlans;
