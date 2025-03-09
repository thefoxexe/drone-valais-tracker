
import { useState } from "react";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
  revenue?: number;
  timeframe?: "7d" | "30d" | "90d";
  setTimeframe?: (timeframe: "7d" | "30d" | "90d") => void;
}

export const DashboardHeader = ({ 
  title = "Dashboard", 
  description = "Vue d'ensemble de vos activités", 
  isLoading, 
  revenue, 
  timeframe, 
  setTimeframe 
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      
      {timeframe && setTimeframe && (
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeframe("7d")}
              className={`px-3 py-1 rounded-md ${
                timeframe === "7d" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              7j
            </button>
            <button
              onClick={() => setTimeframe("30d")}
              className={`px-3 py-1 rounded-md ${
                timeframe === "30d" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              30j
            </button>
            <button
              onClick={() => setTimeframe("90d")}
              className={`px-3 py-1 rounded-md ${
                timeframe === "90d" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              90j
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
