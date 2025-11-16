// components/ui/Toast.jsx
"use client";
import { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const toastTypes = {
  success: {
    icon: CheckCircleIcon,
    className: "bg-green-50 text-green-800 border-green-200",
    iconColor: "text-green-500",
  },
  error: {
    icon: XCircleIcon,
    className: "bg-red-50 text-red-800 border-red-200",
    iconColor: "text-red-500",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: "bg-yellow-50 text-yellow-800 border-yellow-200",
    iconColor: "text-yellow-500",
  },
  info: {
    icon: InformationCircleIcon,
    className: "bg-blue-50 text-blue-800 border-blue-200",
    iconColor: "text-blue-500",
  },
};

export const Toast = ({ toast, onRemove }) => {
  const { id, message, type = "info", duration = 5000 } = toast;
  const { icon: Icon, className, iconColor } = toastTypes[type];

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <div
      className={`flex items-center p-4 rounded-lg border shadow-sm ${className} animate-in slide-in-from-right-full duration-300`}
    >
      <Icon className={`h-5 w-5 ${iconColor} mr-3`} />
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => onRemove(id)}
        className="ml-4 inline-flex text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Toast Hook
import { useState, useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now().toString();
    const toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => {
      addToast(message, "success", duration);
    },
    [addToast]
  );

  const error = useCallback(
    (message, duration) => {
      addToast(message, "error", duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (message, duration) => {
      addToast(message, "warning", duration);
    },
    [addToast]
  );

  const info = useCallback(
    (message, duration) => {
      addToast(message, "info", duration);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
