import React, { useState } from "react";
import { X } from "lucide-react";

interface SensoryData {
  aroma: number;
  body: number;
  aftertaste: number;
  acidity: number;
  sweetness: number;
}

interface SensoryAuditProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SensoryData) => void;
  initialData?: SensoryData;
  title: string;
  subtitle?: string;
}

export function SensoryAudit({ isOpen, onClose, onSave, initialData, title, subtitle }: SensoryAuditProps) {
  const [sensoryData, setSensoryData] = useState<SensoryData>(
    initialData || {
      aroma: 5,
      body: 5,
      aftertaste: 5,
      acidity: 5,
      sweetness: 5,
    }
  );

  const calculateIntegrityScore = () => {
    const total = Object.values(sensoryData).reduce((sum, val) => sum + val, 0);
    return (total / 50) * 100;
  };

  const handleSave = () => {
    onSave(sensoryData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50">
      <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-black">
        <div className="p-4 border-b border-black flex items-center justify-between">
          <div>
            <h2 className="font-bold">{title}</h2>
            {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {/* 5 Range Sliders */}
          <div className="space-y-4">
            {Object.entries(sensoryData).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold capitalize">{key}</label>
                  <span className="text-sm">{value}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={value}
                  onChange={(e) =>
                    setSensoryData({
                      ...sensoryData,
                      [key]: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Integrity Score */}
          <div className="mt-6 p-4 border border-black">
            <p className="text-sm mb-2">Overall Quality Score</p>
            <p className="text-2xl font-bold">{calculateIntegrityScore().toFixed(1)}%</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 px-4 py-2 border border-black bg-black text-white hover:bg-gray-800"
          >
            Save Audit
          </button>
        </div>
      </div>
    </div>
  );
}
