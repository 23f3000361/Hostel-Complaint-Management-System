"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Info, FileImage, FileVideo } from "lucide-react";

const categories = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "furniture", label: "Furniture" },
  { value: "civil", label: "Civil / Structural" },
  { value: "cleaning", label: "Cleaning / Sanitation" },
  { value: "pest", label: "Pest Control" },
  { value: "internet", label: "Internet / Network" },
  { value: "other", label: "Other" },
];

const urgencyLevels = [
  { value: "Emergency", time: "2 days", color: "border-red-300 text-red-700 bg-red-50 hover:border-red-400" },
  { value: "High", time: "4-5 days", color: "border-orange-300 text-orange-700 bg-orange-50 hover:border-orange-400" },
  { value: "Medium", time: "1 week", color: "border-blue-300 text-blue-700 bg-blue-50 hover:border-blue-400" },
  { value: "Low", time: "1 month", color: "border-gray-300 text-gray-700 bg-gray-50 hover:border-gray-400" },
];

const urgencyActiveColors: Record<string, string> = {
  Emergency: "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200",
  High: "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200",
  Medium: "bg-[#3366FF] border-[#3366FF] text-white shadow-lg shadow-blue-200",
  Low: "bg-gray-600 border-gray-600 text-white shadow-lg shadow-gray-200",
};

interface FileItem {
  name: string;
  size: string;
  type: "image" | "video";
}

export function FileComplaintForm() {
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles: FileItem[] = droppedFiles.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
      type: f.type.startsWith("video") ? "video" : "image",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = () => {
    // Simulate file selection
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const selected: FileItem[] = Array.from(target.files).map((f) => ({
          name: f.name,
          size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
          type: f.type.startsWith("video") ? "video" : "image",
        }));
        setFiles((prev) => [...prev, ...selected]);
      }
    };
    input.click();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    // Reset
    setCategory("");
    setUrgency("Medium");
    setDescription("");
    setFiles([]);
  };

  return (
    <div className="border border-white/60 rounded-2xl p-6 bg-white/40 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#3366FF]">
          File New Complaint
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Report a maintenance issue in your room
        </p>
      </div>

      {/* Category */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-800 mb-2 block">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            id="complaint-category"
            className="h-12 bg-white/60 backdrop-blur-sm border-white/50 rounded-xl text-sm"
          >
            <SelectValue placeholder="Select issue type..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Urgency Level */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-800 mb-3 block">
          Urgency Level <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {urgencyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setUrgency(level.value)}
              className={cn(
                "flex flex-col items-start px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                urgency === level.value
                  ? urgencyActiveColors[level.value]
                  : level.color
              )}
            >
              <span className="font-semibold text-sm">{level.value}</span>
              <span
                className={cn(
                  "text-[11px] mt-0.5",
                  urgency === level.value ? "text-white/80" : "opacity-60"
                )}
              >
                {level.time}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-800 mb-2 block">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="complaint-description"
          placeholder="Describe the issue in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] bg-white/60 backdrop-blur-sm border-white/50 rounded-xl resize-none text-sm focus:ring-2 focus:ring-[#3366FF]/20 focus:border-[#3366FF]"
        />
      </div>

      {/* Evidence Upload */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-800 mb-2 block">
          Evidence (Photos/Videos)
        </Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-[#3366FF] bg-blue-50/50 backdrop-blur-sm"
              : "border-gray-300/50 bg-white/30 backdrop-blur-sm hover:border-gray-400/50 hover:bg-white/50"
          )}
          onClick={handleFileSelect}
        >
          <Upload
            className={cn(
              "w-10 h-10 mx-auto mb-3",
              isDragging ? "text-[#3366FF]" : "text-gray-400"
            )}
          />
          <p className="text-sm font-medium text-gray-600 mb-1">
            Drag and drop files here
          </p>
          <p className="text-sm text-gray-400">
            or{" "}
            <span className="text-[#3366FF] font-medium underline underline-offset-2">
              browse from your device
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, MP4 up to 10MB each
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
              >
                {file.type === "image" ? (
                  <FileImage className="w-4 h-4 text-blue-500" />
                ) : (
                  <FileVideo className="w-4 h-4 text-purple-500" />
                )}
                <span className="text-sm text-gray-700 flex-1 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400">{file.size}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 mb-5">
        <Info className="w-5 h-5 text-[#3366FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Instant Notification
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            DSW and your Hostel Warden will be notified immediately upon
            submission. The Shared Institutional Clock starts ticking from the
            moment you submit.
          </p>
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !category || !description}
        className="w-full h-13 bg-gradient-to-r from-[#3366FF] to-[#5588FF] hover:from-[#2952cc] hover:to-[#4477ee] text-white rounded-xl font-bold text-base transition-all duration-200 shadow-lg shadow-blue-300/40 hover:shadow-blue-300/60 disabled:opacity-50 disabled:shadow-none cursor-pointer"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </div>
        ) : (
          "Submit Complaint"
        )}
      </Button>
    </div>
  );
}
