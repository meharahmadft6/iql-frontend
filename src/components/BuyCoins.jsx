// components/payment/BuyCoins.jsx
"use client";
import { useState, useEffect } from "react";
import { API } from "../api/api";
import {
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const BuyCoins = ({ isOpen, onClose, onPaymentSuccess, coinPackages = [] }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);
  const [activeTab, setActiveTab] = useState("packages");

  // Load PayPal SDK
  useEffect(() => {
    if (!isOpen) return;

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
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      script.onerror = () => {
        console.error("Failed to load PayPal SDK");
        setPaypalLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadPaypalSDK();
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setSelectedPackage(null);
    setCustomAmount("");
    setProcessingPayment(false);
    setPaypalButtonRendered(false);
    setActiveTab("packages");
    const container = document.getElementById("paypal-button-container");
    if (container) container.innerHTML = "";
  };

  const calculateCoins = (amount) => {
    const rate = 1000;
    return Math.floor((parseFloat(amount) || 0) * rate);
  };

  const initializePayPalButtons = async (orderID) => {
    const container = document.getElementById("paypal-button-container");
    if (container) {
      container.innerHTML = "";
    }

    try {
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
          },
          createOrder: () => orderID,
          onApprove: async (data) => {
            try {
              const captureResponse = await API.post("/payments/capture", {
                orderID: data.orderID,
              });

              if (captureResponse.data.success) {
                onPaymentSuccess?.(captureResponse.data.data);
                onClose();
              }
            } catch (error) {
              console.error("Payment capture error:", error);
              throw error;
            }
          },
          onError: (err) => {
            console.error("PayPal error:", err);
            setPaypalButtonRendered(false);
          },
          onCancel: () => {
            setPaypalButtonRendered(false);
          },
        })
        .render("#paypal-button-container");

      setPaypalButtonRendered(true);
    } catch (error) {
      console.error("Error rendering PayPal buttons:", error);
      setPaypalButtonRendered(false);
    }
  };

  const handleBuyCoins = async () => {
    if (!paypalLoaded) {
      throw new Error("Payment system is not ready. Please try again.");
    }

    if (paypalButtonRendered) return;

    setProcessingPayment(true);

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

      await initializePayPalButtons(response.data.orderID);
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCustomAmount("");
    setPaypalButtonRendered(false);
    const container = document.getElementById("paypal-button-container");
    if (container) container.innerHTML = "";
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedPackage(null);
    setPaypalButtonRendered(false);
    const container = document.getElementById("paypal-button-container");
    if (container) container.innerHTML = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 rounded-2xl backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-3xl mx-auto
             max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Buy Learning Coins
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  Instant delivery • Secure payment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processingPayment}
              className="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white p-6 overflow-y-auto flex-1">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-blue-50 rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab("packages")}
                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "packages"
                    ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                    : "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                }`}
              >
                <BanknotesIcon className="h-4 w-4 inline mr-2" />
                Packages
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "custom"
                    ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                    : "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                }`}
              >
                <CreditCardIcon className="h-4 w-4 inline mr-2" />
                Custom
              </button>
            </div>

            {/* Packages Tab */}
            {activeTab === "packages" && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {coinPackages.map((pkg, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all group ${
                        selectedPackage?.amount === pkg.amount
                          ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 scale-105"
                          : "border-blue-100 hover:border-blue-300 hover:shadow-md hover:scale-102"
                      }`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <SparklesIcon className="h-4 w-4 text-blue-500 mr-1" />
                          <div className="text-lg font-bold text-blue-700">
                            {pkg.coins.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 mb-2 font-medium">
                          COINS
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                          ${pkg.amount}
                        </div>
                        {pkg.label && (
                          <div className="text-xs text-green-600 font-medium mt-2 bg-green-50 py-1 rounded-lg">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Enter Amount (USD)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={customAmount}
                        onChange={(e) =>
                          handleCustomAmountChange(e.target.value)
                        }
                        placeholder="0.10"
                        className="w-full border border-blue-200 rounded-xl pl-10 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-center">
                      <div className="text-sm text-blue-700 font-medium mb-1">
                        You'll receive
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {calculateCoins(customAmount).toLocaleString()} coins
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Minimum Amount Notice */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 ">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <span className="font-semibold">Minimum purchase:</span> $0.10
                  (100 coins)
                  <br />
                  <span className="text-xs">1 coin = $0.001</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t border-blue-100 pt-6">
              {!paypalLoaded ? (
                <div className="text-center py-4">
                  <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-sm text-blue-700 font-medium">
                    Loading secure payment...
                  </p>
                </div>
              ) : (
                <>
                  {!paypalButtonRendered && (
                    <button
                      onClick={handleBuyCoins}
                      disabled={
                        processingPayment ||
                        (activeTab === "packages" && !selectedPackage) ||
                        (activeTab === "custom" && !customAmount)
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                    >
                      {processingPayment ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 animate-spin mr-3" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="h-5 w-5 mr-3" />
                          Pay $
                          {activeTab === "packages"
                            ? selectedPackage?.amount || "0.00"
                            : customAmount || "0.00"}
                        </>
                      )}
                    </button>
                  )}

                  <div
                    id="paypal-button-container"
                    className="min-h-[45px] rounded-xl overflow-hidden"
                  ></div>

                  {/* Security Footer */}
                  <div className="mt-6 pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-center space-x-6 text-xs text-blue-600">
                      <div className="flex items-center">
                        <LockClosedIcon className="h-3 w-3 mr-1.5" />
                        <span className="font-medium">256-bit SSL</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                        <span className="font-medium">Instant Delivery</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCoins;
