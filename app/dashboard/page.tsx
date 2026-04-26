"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface OMAlert {
  id: string;
  name: string;
  alertType: string;
  enabled: boolean;
  destinations: any[];
}

export default function DashboardPage() {
  const [configureAlert, setConfigureAlert] = useState<OMAlert | null>(null);
  const queryClient = useQueryClient();

  const { data: alerts, isLoading, error } = useQuery<OMAlert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetchApi("/alerts"),
    retry: false,
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/alerts/${id}/disable`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const handleToggle = (alert: OMAlert) => {
    if (alert.enabled) {
      disableMutation.mutate(alert.id);
    } else {
      setConfigureAlert(alert);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Alerts</h1>
          <p className="text-zinc-400 mt-2">Manage your OpenMetadata alerting workflows.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
              <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Integration Required</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">Please connect OpenMetadata to fetch and manage your data alerts.</p>
            <Link href="/dashboard/integrations" className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors inline-block border border-zinc-700">
              Connect Integrations
            </Link>
          </div>
        ) : alerts?.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <p className="mb-4">No alerts found in OpenMetadata.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {alerts?.filter((alert) => alert.alertType !== "ActivityFeed" && alert.alertType !== "GovernanceWorkflowChangeEvent").map((alert) => (
              <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-white">{alert.name}</h3>
                  {alert.alertType && (
                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {alert.alertType}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleToggle(alert)}
                  disabled={disableMutation.isPending && disableMutation.variables === alert.id}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${alert.enabled ? 'bg-indigo-600' : 'bg-zinc-700'} ${(disableMutation.isPending && disableMutation.variables === alert.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${alert.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {configureAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Configure Alert: {configureAlert.name}</h2>
            </div>
            <div className="p-6">
              <p className="text-zinc-400 mb-6">Setup where and how you want to receive this alert.</p>

            </div>
            <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex justify-end space-x-3">
              <button
                onClick={() => setConfigureAlert(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Enable Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
