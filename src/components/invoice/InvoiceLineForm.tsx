
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceLine {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceLineFormProps {
  lines: InvoiceLine[];
  onChange: (lines: InvoiceLine[]) => void;
}

export const InvoiceLineForm = ({ lines, onChange }: InvoiceLineFormProps) => {
  const addLine = () => {
    onChange([
      ...lines,
      { description: "", quantity: 1, unit_price: 0, total: 0 },
    ]);
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };

    // Recalculate total for this line
    if (field === "quantity" || field === "unit_price") {
      newLines[index].total = Number(newLines[index].quantity) * Number(newLines[index].unit_price);
    }

    onChange(newLines);
  };

  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    onChange(newLines);
  };

  return (
    <div className="space-y-4">
      {lines.map((line, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1">
            <Input
              placeholder="Description"
              value={line.description}
              onChange={(e) => updateLine(index, "description", e.target.value)}
            />
          </div>
          <div className="w-24">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Quantité"
              value={line.quantity}
              onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="w-32">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Prix unitaire"
              value={line.unit_price}
              onChange={(e) => updateLine(index, "unit_price", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="w-32">
            <Input
              type="number"
              value={line.total}
              disabled
              className="bg-gray-50"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeLine(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addLine}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une ligne
      </Button>
    </div>
  );
};
