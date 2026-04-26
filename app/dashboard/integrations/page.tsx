"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import Image from "next/image";

const SLACK_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/integration/slack/callback`;

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [omModalOpen, setOmModalOpen] = useState(false);
  const [omToken, setOmToken] = useState("");

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchApi("/user/profile"),
  });

  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: ["integration"],
    queryFn: () => fetchApi("/integration").catch(() => null),
  });

  const omMutation = useMutation({
    mutationFn: async (token: string) => {
      return fetchApi("/integration/open-metadata", {
        method: "POST",
        body: JSON.stringify({ omBotToken: token }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration"] });
      setOmModalOpen(false);
      setOmToken("");
    },
  });

  if (isLoadingUser || isLoadingIntegration) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSlackConnected = !!integration?.slackBotToken;
  const isOmConnected = !!integration?.omBotToken;

  const handleConnectSlack = () => {
    if (!user?.id) return;
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=${process.env.NEXT_PUBLIC_OAUTH_SCOPES}&redirect_uri=${SLACK_REDIRECT_URI}&state=${user.id}`;
    window.location.href = authUrl;
  };

  const handleSaveOmToken = async () => {
    if (!omToken.trim()) return;

    const res = await fetch("/api/validate-om", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: omToken }),
    });

    if (res.ok) {
      omMutation.mutate(omToken);
    } else {
      alert("Invalid OpenMetadata token");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Integrations</h1>
        <p className="text-zinc-400 mt-2">Connect third-party services to Metal Alert workflows.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Image src="https://play-lh.googleusercontent.com/mzJpTCsTW_FuR6YqOPaLHrSEVCSJuXzCljdxnCKhVZMcu6EESZBQTCHxMh8slVtnKqo" alt="Slack" width={64} height={64} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Slack</h3>
              <p className="text-sm text-zinc-400 mt-1">Send alerts directly to your Slack channels.</p>
            </div>
          </div>

          <div>
            {isSlackConnected ? (
              <div className="flex items-center space-x-3 bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-800">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium text-sm tracking-wide">Connected</span>
              </div>
            ) : (
              <button
                onClick={handleConnectSlack}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Connect Slack
              </button>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Image src="https://avatars.githubusercontent.com/u/86132257?s=280&v=4" alt="OpenMetadata" width={64} height={64} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">OpenMetadata</h3>
              <p className="text-sm text-zinc-400 mt-1">Connect your OpenMetadata instance to sync events.</p>
            </div>
          </div>

          <div>
            {isOmConnected ? (
              <div className="flex items-center space-x-3 bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-800">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium text-sm tracking-wide">Connected</span>
                <button
                  onClick={() => setOmModalOpen(true)}
                  className="ml-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Update Token
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOmModalOpen(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Connect OpenMetadata
              </button>
            )}
          </div>
        </div>
      </div>

      {omModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">Connect OpenMetadata</h2>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-indigo-300 mb-1">Instructions</h4>
                <p className="text-sm text-zinc-300">
                  In OpenMetadata, go to <strong>Settings</strong> → <strong>Bots</strong> → <strong>Ingestion Bot</strong> and copy the token.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Bot Token</label>
                <input
                  type="password"
                  value={omToken}
                  onChange={(e) => setOmToken(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                />
              </div>
            </div>

            <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex justify-end space-x-3">
              <button
                onClick={() => setOmModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                disabled={omMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOmToken}
                disabled={omMutation.isPending || !omToken.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {omMutation.isPending ? "Saving..." : "Save Token"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
