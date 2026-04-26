"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface MessageField {
  key: string;
  value: string;
}

interface ActionButton {
  id: string;
  label: string;
  type: "ack" | "ai" | "link";
  payload?: any;
}

interface MessageLayout {
  header?: { title?: string };
  sections: MessageField[];
  buttons?: ActionButton[];
}

interface OMAlert {
  id: string;
  name: string;
  alertType: string;
  enabled: boolean;
  destinations: any[];
}

export default function DashboardPage() {
  const [configureAlert, setConfigureAlert] = useState<OMAlert | null>(null);

  // Configuration State
  const [recipientType, setRecipientType] = useState<string>("channel");
  const [selectedRecipients, setSelectedRecipients] = useState<{ id: string, name: string }[]>([]);
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [sections, setSections] = useState<MessageField[]>([]);
  const [buttons, setButtons] = useState<ActionButton[]>([]);

  // Message Fields State
  const [fieldSearch, setFieldSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [hideEmptyFields, setHideEmptyFields] = useState(false);
  const [displayFullMessage, setDisplayFullMessage] = useState(false);
  
  const availableFields = {
    "General": [
      { id: "userName", name: "Triggered By", value: "userName" },
      { id: "entityType", name: "Entity Type", value: "entityType" },
      { id: "eventType", name: "Event Type", value: "eventType" },
      { id: "entityFullyQualifiedName", name: "Entity FQN", value: "entityFullyQualifiedName" },
      { id: "timestamp", name: "Timestamp", value: "timestamp" },
      { id: "currentVersion", name: "Version", value: "currentVersion" },
    ],
    "Entity Details": [
      { id: "entityStatus", name: "Entity Status", value: "entity.entityStatus" },
      { id: "entityOwner", name: "Entity Owner", value: "entity.owners.0.name" },
      { id: "entityCreatedBy", name: "Created By", value: "entity.createdBy" },
      { id: "entityCreatedAt", name: "Created At", value: "entity.createdAt" },
    ],
    "Change Details": [
      { id: "updatedField", name: "Updated Field", value: "changeDescription.fieldsUpdated.0.name" },
      { id: "contractStatus", name: "Contract Status", value: "changeDescription.fieldsUpdated.0.newValue.dataContractResult.contractExecutionStatus" },
      { id: "failedTests", name: "Failed Tests", value: "changeDescription.fieldsUpdated.0.newValue.dataContractResult.qualityValidation.failed" },
      { id: "passedTests", name: "Passed Tests", value: "changeDescription.fieldsUpdated.0.newValue.dataContractResult.qualityValidation.passed" },
      { id: "qualityScore", name: "Quality Score", value: "changeDescription.fieldsUpdated.0.newValue.dataContractResult.qualityValidation.qualityScore" },
    ]
  };

  const handleFieldToggle = (field: { id: string, name: string, value: string }) => {
    const exists = sections.find(s => s.key === field.name);
    if (exists) {
      setSections(sections.filter(s => s.key !== field.name));
    } else {
      setSections([...sections, { key: field.name, value: field.value }]);
    }
  };

  const filteredFields = availableFields[selectedCategory as keyof typeof availableFields].filter(f => 
    f.name.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const queryClient = useQueryClient();

  const { data: alerts, isLoading, error } = useQuery<OMAlert[]>({
    queryKey: ["alerts"],
    queryFn: () => fetchApi("/alerts"),
    retry: false,
  });

  const { data: slackSuggestions } = useQuery<{ id: string, name: string, type: string }[]>({
    queryKey: ["slackSuggestions", recipientType],
    queryFn: () => fetchApi(`/slack/${recipientType === 'user' ? 'users' : 'channels'}`),
    enabled: !!configureAlert,
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/alerts/${id}/disable`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const enableMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const layout: MessageLayout = {
        header: headerTitle ? { title: headerTitle } : undefined,
        sections: sections.filter(s => s.key || s.value),
        buttons: buttons.length > 0 ? buttons : undefined,
      };

      return fetchApi(`/alerts/config?id=${alertId}`, {
        method: "POST",
        body: JSON.stringify({
          enabled: true,
          recipientType,
          recipients: selectedRecipients.map(r => r.id).join(","),
          messageLayout: [layout]
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      setConfigureAlert(null);
      // Reset state
      setRecipientType("channel");
      setSelectedRecipients([]);
      setRecipientInput("");
      setHeaderTitle("");
      setSections([{ key: "", value: "" }]);
      setButtons([]);
    },
  });

  const handleToggle = (alert: OMAlert) => {
    if (alert.enabled) {
      disableMutation.mutate(alert.id);
    } else {
      setConfigureAlert(alert);
    }
  };

  const filteredSuggestions = slackSuggestions?.filter(
    s => !selectedRecipients.find(r => r.id === s.id) &&
      (s.name.toLowerCase().includes(recipientInput.toLowerCase()) || recipientInput === "")
  ).slice(0, 5);

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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Configure Alert: {configureAlert.name}</h2>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <p className="text-zinc-400">Setup where and how you want to receive this alert.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Recipient Type</label>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="channel">Channel</option>
                    <option value="user">User</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Recipients</label>
                  <div className="relative">
                    <div className="min-h-[44px] p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                      {selectedRecipients.map((recipient) => (
                        <span key={recipient.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/20">
                          {recipient.name}
                          <button
                            onClick={() => setSelectedRecipients(selectedRecipients.filter(r => r.id !== recipient.id))}
                            className="hover:text-white transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={recipientInput}
                        onChange={(e) => setRecipientInput(e.target.value)}
                        placeholder={selectedRecipients.length === 0 ? `Search ${recipientType}s...` : ""}
                        className="flex-1 min-w-[120px] bg-transparent border-none text-white text-sm focus:ring-0 px-2"
                      />
                    </div>

                    {recipientInput && filteredSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => {
                              setSelectedRecipients([...selectedRecipients, suggestion]);
                              setRecipientInput("");
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-between"
                          >
                            <span>{suggestion.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{suggestion.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <h3 className="text-lg font-medium text-white mb-4">Message Layout Builder</h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Header Title (Optional)</label>
                      <input
                        type="text"
                        value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)}
                        placeholder="e.g. 🚨 New Alert Triggered"
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-zinc-300">Message Fields</label>
                        <button className="text-[10px] uppercase tracking-wider font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          Useful tips
                        </button>
                      </div>
                      
                      <div className="border border-zinc-800 rounded-2xl overflow-hidden flex h-72 bg-zinc-950">
                        {/* Sidebar */}
                        <div className="w-40 border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto">
                          {Object.keys(availableFields).map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`w-full px-4 py-3 text-left text-xs font-medium transition-colors border-l-2 ${
                                selectedCategory === category 
                                  ? "bg-indigo-500/5 text-indigo-400 border-indigo-500" 
                                  : "text-zinc-500 border-transparent hover:text-zinc-300"
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                        
                        {/* Field List */}
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="p-3 border-b border-zinc-800">
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <input
                                type="text"
                                value={fieldSearch}
                                onChange={(e) => setFieldSearch(e.target.value)}
                                placeholder="Search and Select field"
                                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                            {filteredFields.map((field) => {
                              const isSelected = sections.some(s => s.key === field.name);
                              return (
                                <button
                                  key={field.id}
                                  onClick={() => handleFieldToggle(field)}
                                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors group"
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isSelected ? "bg-indigo-600 border-indigo-600" : "border-zinc-700 bg-transparent group-hover:border-zinc-500"
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-xs font-medium transition-colors ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}>
                                    {field.name}
                                  </span>
                                  <span className="ml-auto text-[9px] text-zinc-600 uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {selectedCategory}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="p-3 border-t border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
                             <span className="text-[10px] text-zinc-500 font-medium">
                               {sections.length} fields selected
                             </span>
                             <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 rounded transition-colors border border-zinc-700">
                               Show field(s)
                             </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={hideEmptyFields}
                            onChange={(e) => setHideEmptyFields(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 transition-colors"
                          />
                          <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Hide fields when empty</span>
                          <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={displayFullMessage}
                            onChange={(e) => setDisplayFullMessage(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 transition-colors"
                          />
                          <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Display full message</span>
                          <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-zinc-300">Action Buttons</label>
                        <button
                          onClick={() => setButtons([...buttons, { id: Date.now().toString(), label: "", type: "link" }])}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          + Add Button
                        </button>
                      </div>
                      <div className="space-y-3">
                        {buttons.map((button, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <select
                              value={button.type}
                              onChange={(e) => {
                                const newButtons = [...buttons];
                                newButtons[idx].type = e.target.value as any;
                                setButtons(newButtons);
                              }}
                              className="w-1/3 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="link">Link</option>
                              <option value="ack">Acknowledge</option>
                              <option value="ai">AI Analysis</option>
                            </select>
                            <input
                              type="text"
                              value={button.label}
                              onChange={(e) => {
                                const newButtons = [...buttons];
                                newButtons[idx].label = e.target.value;
                                setButtons(newButtons);
                              }}
                              placeholder="Button Label"
                              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => setButtons(buttons.filter((_, i) => i !== idx))}
                              className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setConfigureAlert(null);
                  setRecipientType("channel");
                  setSelectedRecipients([]);
                  setRecipientInput("");
                  setHeaderTitle("");
                  setSections([]);
                  setButtons([]);
                  setFieldSearch("");
                  setSelectedCategory("General");
                  setHideEmptyFields(false);
                  setDisplayFullMessage(false);
                }}
                disabled={enableMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => enableMutation.mutate(configureAlert.id)}
                disabled={enableMutation.isPending || selectedRecipients.length === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-900/20"
              >
                {enableMutation.isPending ? "Saving..." : "Enable Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
