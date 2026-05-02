"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Eye, AlertTriangle } from "lucide-react";

const STEPS = [
  "Filed",
  "In Queue",
  "Work in\nProgress",
  "Technical\nProof",
  "Warden Check",
  "Resolved",
];

type UrgencyLevel = "Emergency" | "High" | "Medium" | "Low";

interface ClockSegment {
  label: string;
  duration: string;
  color: string;
}

interface ComplaintCardProps {
  id: string;
  status: string;
  urgency: UrgencyLevel;
  timeRemaining: string;
  hostel: string;
  room: string;
  category: string;
  description: string;
  currentStep: number; // 0-indexed, how many steps completed
  clockSegments: ClockSegment[];
  totalTime: string;
  remainingTime: string;
  healthPercent: number;
  healthStatus: "HEALTHY" | "WARNING" | "CRITICAL";
  assignedTo?: string;
  notification?: string;
}

const urgencyConfig: Record<
  UrgencyLevel,
  { bg: string; text: string; dot: string; border: string }
> = {
  Emergency: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    border: "border-red-200",
  },
  High: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  Medium: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    border: "border-blue-200",
  },
  Low: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-500",
    border: "border-gray-200",
  },
};

const healthConfig = {
  HEALTHY: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "✓",
  },
  WARNING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "⚠",
  },
  CRITICAL: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "✕",
  },
};

export function ComplaintCard({
  id,
  status,
  urgency,
  timeRemaining,
  hostel,
  room,
  category,
  description,
  currentStep,
  clockSegments,
  totalTime,
  remainingTime,
  healthPercent,
  healthStatus,
  assignedTo,
  notification,
}: ComplaintCardProps) {
  const uConf = urgencyConfig[urgency];
  const hConf = healthConfig[healthStatus];

  // Calculate used percentage from clock segments
  const usedPercent = healthPercent;

  // Determine clock bar colors based on health
  const getSegmentColor = (segment: ClockSegment) => {
    if (healthStatus === "WARNING") return "bg-amber-400";
    if (healthStatus === "CRITICAL") return "bg-red-500";
    return segment.color || "bg-[#3366FF]";
  };

  return (
    <div className="border border-white/60 rounded-2xl p-6 bg-white/50 backdrop-blur-xl shadow-lg shadow-blue-900/5 hover:shadow-xl hover:bg-white/60 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">{id}</h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-white/50 backdrop-blur-sm text-gray-700 border-white/60">
            {status}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold",
            uConf.bg,
            uConf.text,
            "border",
            uConf.border
          )}
        >
          <span
            className={cn("w-2 h-2 rounded-full", uConf.dot, "animate-pulse")}
          />
          {urgency}
          <Clock className="w-3.5 h-3.5" />
          {timeRemaining}
        </div>
      </div>

      {/* Location & Category */}
      <p className="text-sm text-gray-500 mb-2">
        {hostel} • Room {room} • {category}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-6">{description}</p>

      {/* Progress Stepper */}
      <div className="flex items-start justify-between mb-6 px-1">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={step} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className={cn(
                    "absolute top-[18px] right-1/2 w-full h-[3px] -z-0",
                    isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  )}
                />
              )}

              {/* Circle */}
              <div className="relative z-10">
                {isActive ? (
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center",
                      isCurrent
                        ? "bg-emerald-500 ring-4 ring-emerald-100"
                        : "bg-emerald-500"
                    )}
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full border border-white/60 bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <Circle className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Label */}
              <p
                className={cn(
                  "text-[11px] font-medium mt-2 text-center whitespace-pre-line leading-tight",
                  isActive ? "text-gray-900" : "text-gray-400"
                )}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50/50 backdrop-blur-sm border border-emerald-200/50 mb-4">
          <Eye className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              {notification}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Click &quot;View Evidence Chain&quot; to see technical fix proof.
            </p>
          </div>
        </div>
      )}

      {/* Shared Institutional Clock */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">
            Shared Institutional Clock
          </span>
        </div>

        <div className="relative h-8 rounded-full bg-emerald-100/50 backdrop-blur-sm border border-white/50 overflow-hidden mb-2">
          {/* Used segments */}
          <div
            className="absolute inset-y-0 left-0 flex rounded-l-full overflow-hidden"
            style={{ width: `${usedPercent}%`, minWidth: usedPercent > 0 ? "20px" : "0" }}
          >
            {clockSegments.map((seg, i) => (
              <div
                key={i}
                className={cn("h-full", getSegmentColor(seg))}
                style={{ flex: 1 }}
              />
            ))}
          </div>

          {/* Remaining label centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 bg-white/70 px-3 py-0.5 rounded-full backdrop-blur-sm">
              {remainingTime} remaining
            </span>
          </div>
        </div>

        {/* Clock legend */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {clockSegments.map((seg, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    healthStatus === "WARNING"
                      ? "bg-amber-400"
                      : healthStatus === "CRITICAL"
                        ? "bg-red-500"
                        : seg.color || "bg-[#3366FF]"
                  )}
                />
                <span className="text-gray-500">
                  {seg.label}: {seg.duration}
                </span>
              </div>
            ))}
          </div>
          <span className="text-gray-500 font-medium">Total: {totalTime}</span>
        </div>
      </div>

      {/* Health badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
            hConf.bg,
            hConf.text,
            hConf.border
          )}
        >
          {healthStatus === "WARNING" ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <span>{hConf.icon}</span>
          )}
          {healthStatus} ({healthPercent}%)
        </span>
        {healthStatus === "WARNING" && (
          <span className="text-xs italic text-gray-400">
            Time is a non-renewable resource
          </span>
        )}
      </div>

      {/* Assigned to */}
      {assignedTo && (
        <p className="text-xs text-gray-500 mb-3">
          Assigned to:{" "}
          <span className="font-medium text-gray-700">{assignedTo}</span>
        </p>
      )}

      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm text-[#3366FF] text-sm font-semibold hover:bg-white/60 hover:shadow-md transition-all duration-200">
        <Eye className="w-4 h-4" />
        View Evidence Chain
      </button>
    </div>
  );
}
