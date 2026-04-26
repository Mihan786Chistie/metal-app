import Link from "next/link";
import Image from "next/image";
import metalLogo from "@/public/metalLogo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans selection:bg-indigo-500/30">

      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/20 p-1 rounded-lg">
              <Image src={metalLogo} width={32} height={32} alt="Metal Logo" className="rounded-lg" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Metal</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/join" className="text-sm font-medium px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 translate-x-1/4 -translate-y-1/4 w-[400px] h-[400px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center z-10 py-20">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-zinc-300">OpenMetadata Integration Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
            Smart Alerts for your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
              Data Workflows
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect OpenMetadata and Slack to build powerful, automated alerting workflows.
            Keep your team in sync with real-time data contract validations and schema changes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/join" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-[0_0_40px_8px_rgba(79,70,229,0.2)] hover:shadow-[0_0_60px_12px_rgba(79,70,229,0.3)] text-lg">
              Start Building
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium rounded-xl transition-colors text-lg">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} Metal. All rights reserved.</p>
      </footer>
    </div>
  );
}
