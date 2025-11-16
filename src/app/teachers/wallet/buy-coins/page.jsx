"use client";
import { useState, useEffect, useRef } from "react";
import { API } from "../../../../api/api";
import DashboardLayout from "../../../layout/teacher/DashboardLayout";
import {
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, useToast } from "../../../../components/Toast";

const BuyCoinsPage = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);
  const [cardFieldsRendered, setCardFieldsRendered] = useState(false);
  const [activeTab, setActiveTab] = useState("packages");
  const [coinPackages, setCoinPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const router = useRouter();
  const { toasts, removeToast, success, error, info } = useToast();
  const paypalButtonsRef = useRef(null);
  const cardFieldsRef = useRef(null);

  useEffect(() => {
    fetchCoinPackages();
    loadPaypalSDK();
  }, []);

  // Re-initialize payment methods when showPaymentMethods changes
  useEffect(() => {
    if (showPaymentMethods && paypalLoaded) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializePayPalButtons();
        initializeCardFields();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showPaymentMethods, paypalLoaded]);

  const fetchCoinPackages = async () => {
    try {
      const response = await API.get("/payments/packages");
      setCoinPackages(response.data.data || []);
    } catch (err) {
      console.error("Error fetching coin packages:", err);
      error("Failed to load coin packages");
    } finally {
      setLoading(false);
    }
  };

  const loadPaypalSDK = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    if (document.querySelector('script[src*="paypal.com/sdk"]')) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&components=buttons,card-fields`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      // If we're already on payment methods, initialize
      if (showPaymentMethods) {
        setTimeout(() => {
          initializePayPalButtons();
          initializeCardFields();
        }, 100);
      }
    };
    script.onerror = () => {
      console.error("Failed to load PayPal SDK");
      setPaypalLoaded(false);
      error("Failed to load payment system");
    };
    document.head.appendChild(script);
  };

  const calculateCoins = (amount) => {
    const rate = 1000;
    return Math.floor((parseFloat(amount) || 0) * rate);
  };

  const createPaymentOrder = async () => {
    try {
      let amount;
      if (activeTab === "packages" && selectedPackage) {
        amount = selectedPackage.amount;
      } else if (activeTab === "custom" && customAmount) {
        amount = parseFloat(customAmount);
        if (isNaN(amount) || amount < 0.1) {
          throw new Error("Minimum purchase amount is $0.10");
        }
      } else {
        throw new Error("Please select a package or enter custom amount");
      }

      const response = await API.post("/payments/create", { amount });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create payment");
      }

      return response.data.orderID;
    } catch (err) {
      console.error("Error creating payment:", err);
      error(err.message || "Failed to process payment");
      throw err;
    }
  };

  const cleanupPayPalButtons = () => {
    const container = document.getElementById("paypal-button-container");
    if (container) {
      container.innerHTML = "";
    }
    setPaypalButtonRendered(false);
    paypalButtonsRef.current = null;
  };

  const cleanupCardFields = () => {
    const container = document.getElementById("card-fields-container");
    if (container) {
      container.innerHTML = "";
    }
    setCardFieldsRendered(false);
    cardFieldsRef.current = null;
  };

  const initializePayPalButtons = async () => {
    cleanupPayPalButtons();

    try {
      const container = document.getElementById("paypal-button-container");
      if (!container) {
        console.error("PayPal container not found");
        return;
      }

      paypalButtonsRef.current = window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
            height: 48,
          },
          createOrder: async () => {
            try {
              setProcessingPayment(true);
              const orderID = await createPaymentOrder();
              return orderID;
            } catch (err) {
              console.error("Error in createOrder:", err);
              throw err;
            } finally {
              setProcessingPayment(false);
            }
          },
          onApprove: async (data) => {
            try {
              setProcessingPayment(true);
              const captureResponse = await API.post("/payments/capture", {
                orderID: data.orderID,
              });

              if (captureResponse.data.success) {
                success(
                  `${captureResponse.data.data.coinsAdded.toLocaleString()} coins added to your wallet!`
                );
                setTimeout(() => {
                  router.push("/teachers/wallet");
                }, 2000);
              }
            } catch (err) {
              console.error("Payment capture error:", err);
              error("Payment failed. Please try again.");
            } finally {
              setProcessingPayment(false);
            }
          },
          onError: (err) => {
            console.error("PayPal error:", err);
            error("Payment error occurred");
            setPaypalButtonRendered(false);
          },
          onCancel: () => {
            info("Payment cancelled");
            setPaypalButtonRendered(false);
          },
        })
        .render("#paypal-button-container");

      setPaypalButtonRendered(true);
    } catch (err) {
      console.error("Error rendering PayPal buttons:", err);
      error("Failed to initialize PayPal payment");
      setPaypalButtonRendered(false);
    }
  };

  const checkElementExists = (id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element #${id} not found`);
      return false;
    }
    return true;
  };

  const initializeCardFields = async () => {
    cleanupCardFields();

    // Check if all required elements exist
    const requiredElements = [
      "card-number-field",
      "card-expiry-field",
      "card-cvv-field",
      "card-name-field",
      "card-submit-button",
    ];

    for (const elementId of requiredElements) {
      if (!checkElementExists(elementId)) {
        // error("Payment form not ready. Please try again.");
        return;
      }
    }

    if (!window.paypal || !window.paypal.CardFields) {
      error("Card payment system not available");
      return;
    }

    try {
      cardFieldsRef.current = window.paypal.CardFields({
        createOrder: async () => {
          try {
            setProcessingPayment(true);
            const orderID = await createPaymentOrder();
            return orderID;
          } catch (err) {
            console.error("Error in createOrder:", err);
            throw err;
          } finally {
            setProcessingPayment(false);
          }
        },
        onApprove: async (data) => {
          try {
            setProcessingPayment(true);
            const captureResponse = await API.post("/payments/capture", {
              orderID: data.orderID,
            });

            if (captureResponse.data.success) {
              success(
                `${captureResponse.data.data.coinsAdded.toLocaleString()} coins added to your wallet!`
              );
              setTimeout(() => {
                router.push("/teachers/wallet");
              }, 2000);
            }
          } catch (err) {
            console.error("Payment capture error:", err);
            error("Payment failed. Please try again.");
          } finally {
            setProcessingPayment(false);
          }
        },
        onError: (err) => {
          console.error("Card fields error:", err);
          error("Payment error occurred");
        },
      });

      if (cardFieldsRef.current.isEligible()) {
        // Render card fields with error handling
        try {
          const nameField = cardFieldsRef.current.NameField();
          await nameField.render("#card-name-field");

          const numberField = cardFieldsRef.current.NumberField();
          await numberField.render("#card-number-field");

          const cvvField = cardFieldsRef.current.CVVField();
          await cvvField.render("#card-cvv-field");

          const expiryField = cardFieldsRef.current.ExpiryField();
          await expiryField.render("#card-expiry-field");

          const submitButton = cardFieldsRef.current.submit();
          await submitButton.render("#card-submit-button");

          setCardFieldsRendered(true);
        } catch (renderError) {
          console.error("Error rendering card fields:", renderError);
          error("Failed to initialize card payment form");
          cleanupCardFields();
        }
      } else {
        error("Card payments are not available in your region");
      }
    } catch (err) {
      console.error("Error initializing card fields:", err);
      error("Failed to initialize card payment");
      cleanupCardFields();
    }
  };

  const handleContinueToPayment = () => {
    setShowPaymentMethods(true);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCustomAmount("");
    cleanupPayPalButtons();
    cleanupCardFields();
    setShowPaymentMethods(false);
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedPackage(null);
    cleanupPayPalButtons();
    cleanupCardFields();
    setShowPaymentMethods(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    cleanupPayPalButtons();
    cleanupCardFields();
    setShowPaymentMethods(false);
  };

  const handleBackToSelection = () => {
    setShowPaymentMethods(false);
    cleanupPayPalButtons();
    cleanupCardFields();
  };

  const getSelectedAmount = () => {
    if (activeTab === "packages" && selectedPackage) {
      return selectedPackage.amount;
    } else if (activeTab === "custom" && customAmount) {
      return parseFloat(customAmount);
    }
    return 0;
  };

  const getSelectedCoins = () => {
    const amount = getSelectedAmount();
    return calculateCoins(amount);
  };

  if (loading) {
    return (
      <DashboardLayout title="Buy Coins">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Buy Coins">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/teachers/wallet"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Wallet
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Coins</h1>
          <p className="text-gray-600 mt-2">
            Choose a package or enter custom amount to buy coins
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Content */}
          <div className="p-6">
            {/* Selection Section */}
            {!showPaymentMethods ? (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => handleTabChange("packages")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "packages"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <BanknotesIcon className="h-4 w-4 inline mr-2" />
                    Packages
                  </button>
                  <button
                    onClick={() => handleTabChange("custom")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "custom"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCardIcon className="h-4 w-4 inline mr-2" />
                    Custom
                  </button>
                </div>

                {/* Packages Tab */}
                {activeTab === "packages" && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coinPackages.map((pkg, index) => (
                        <div
                          key={index}
                          className={`border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                            selectedPackage?.amount === pkg.amount
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={() => handlePackageSelect(pkg)}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {pkg.coins.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              coins
                            </div>
                            <div className="text-xl font-semibold text-gray-900 mb-2">
                              ${pkg.amount}
                            </div>
                            {pkg.label && (
                              <div className="text-sm text-green-600 font-medium px-3 py-1 bg-green-50 rounded-full">
                                {pkg.label}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Amount Tab */}
                {activeTab === "custom" && (
                  <div className="mb-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Enter Amount (USD)
                        </label>
                        <div className="flex items-center max-w-xs">
                          <span className="text-gray-500 mr-3 text-lg">$</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={customAmount}
                            onChange={(e) =>
                              handleCustomAmountChange(e.target.value)
                            }
                            placeholder="0.10"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      {customAmount && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <div className="text-center">
                            <div className="text-sm text-blue-700 mb-1">
                              You'll receive
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {calculateCoins(customAmount).toLocaleString()}{" "}
                              coins
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleContinueToPayment}
                  disabled={
                    (activeTab === "packages" && !selectedPackage) ||
                    (activeTab === "custom" && !customAmount)
                  }
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4 flex items-center justify-center text-lg"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-3" />
                  Continue to Payment - $
                  {activeTab === "packages"
                    ? selectedPackage?.amount || "0.00"
                    : customAmount || "0.00"}
                </button>

                {/* Minimum Amount Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <strong>Minimum purchase:</strong> $0.10 (100 coins).
                      Coins are delivered instantly after successful payment.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Payment Methods Section */
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={handleBackToSelection}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Selection
                </button>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">Purchase Amount</p>
                      <p className="text-sm text-gray-500">
                        {getSelectedCoins().toLocaleString()} coins
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ${getSelectedAmount().toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">USD</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Select Payment Method
                  </h3>

                  {/* Card Payment */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <CreditCardIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">
                        Debit or Credit Card
                      </span>
                    </div>

                    <div id="card-fields-container" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <div
                          id="card-number-field"
                          className="border border-gray-300 rounded-lg p-3 min-h-[48px] bg-white"
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <div
                            id="card-expiry-field"
                            className="border border-gray-300 rounded-lg p-3 min-h-[48px] bg-white"
                          ></div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <div
                            id="card-cvv-field"
                            className="border border-gray-300 rounded-lg p-3 min-h-[48px] bg-white"
                          ></div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card
                        </label>
                        <div
                          id="card-name-field"
                          className="border border-gray-300 rounded-lg p-3 min-h-[48px] bg-white"
                        ></div>
                      </div>

                      <div className="flex justify-center pt-4">
                        <div
                          id="card-submit-button"
                          className="min-h-[48px] w-full max-w-md"
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center my-8">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* PayPal Payment */}
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <CurrencyDollarIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">PayPal</span>
                    </div>

                    {!paypalLoaded ? (
                      <div className="text-center py-4">
                        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Loading payment system...
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div
                          id="paypal-button-container"
                          className="min-h-[55px] w-full max-w-md"
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="text-center pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center">
                        <LockClosedIcon className="h-4 w-4 mr-2" />
                        <span>Secure payment processing</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        <span>Instant coin delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyCoinsPage;
