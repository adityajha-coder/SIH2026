import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { askLegalAssistant } from "@/lib/api/legalAssistant";
import {
  X,
  Send,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Bot,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import botLogo from "@/assets/bot.jpg";

// Single frequently asked question as requested
const QUICK_PROMPTS = [
  {
    icon: Compass,
    label: "How to use Pragati-GovX?",
    query: "How do I use the Pragati-GovX platform, add my details, and apply for government challenges?",
  },
];

export default function StartupLegalAssistantWidget() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isStartup = Boolean(
    isAuthenticated && (user?.role === "STARTUP_USER" || user?.role === "ADMIN")
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isStartup && isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isStartup, isOpen, messages]);

  // Strictly restricted to authenticated startups and admins (placed AFTER all hooks)
  if (!isStartup) {
    return null;
  }

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await askLegalAssistant({
        query,
        conversationHistory: history,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          response?.answer ||
          "I received your query but could not generate a detailed response. Please try again.",
        officialLinks: response?.officialLinks || [],
        platformActions: response?.platformActions || [],
        model: response?.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("[Startup Mitra] Error:", err);
      const serverMsg =
        err?.message ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message;
      if (serverMsg && !serverMsg.includes("properties of undefined")) {
        toast.error(serverMsg);
      } else {
        toast.error("Could not reach Startup Mitra service. Please retry.");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I encountered a temporary connection issue. Please ensure your query is specific, or try again in a moment.",
          officialLinks: [
            {
              title: "Startup India Hub",
              url: "https://www.startupindia.gov.in",
              description: "Official DPIIT recognition and statutory framework portal.",
            },
          ],
          platformActions: [
            {
              title: "Startup Passport",
              route: "/startup/profile",
              description: "Verify your details.",
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputQuery("");
  };

  return (
    <>
      {/* Floating Trigger Button (Clean website blue with bot logo) */}
      {!isOpen && (
        <button
          id="startup-mitra-trigger-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full transition-colors duration-150 border border-blue-400/40"
          title="Open Startup Mitra"
        >
          <img
            src={botLogo}
            alt="Startup Mitra Logo"
            className="w-6 h-6 rounded-full object-contain bg-white"
          />
          <span className="text-sm font-semibold tracking-tight">Startup Mitra</span>
        </button>
      )}

      {/* Slide-out Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[460px] h-[600px] max-h-[90vh] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
          {/* Header (Clean Website Blue #2563EB with Bot Logo) */}
          <div className="px-5 py-3.5 bg-[#2563EB] text-white flex items-center justify-between border-b border-blue-700">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden border border-white/30 shadow-xs">
                <img
                  src={botLogo}
                  alt="Startup Mitra"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                  Startup Mitra
                </h3>
                <p className="text-[11px] text-blue-100 font-normal mt-1">
                  Pragati-GovX Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Reset Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-between py-1 space-y-3">
                <div className="space-y-3">
                  {/* Welcome Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <p className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                      <img
                        src={botLogo}
                        alt="Startup Mitra"
                        className="w-4 h-4 rounded-full object-contain"
                      />
                      Namaste, {user?.name || "Founder"}!
                    </p>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      I am <strong>Startup Mitra</strong>, your assistant on Pragati-GovX.
                      Ask me anything about how the platform works, public procurement benefits, or how to apply for challenges.
                    </p>
                  </div>

                  {/* Single Frequently Asked Question */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1 px-1">
                      <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                      Frequently Asked Question:
                    </p>
                    <div>
                      {QUICK_PROMPTS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(item.query)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 text-left text-slate-800 hover:text-[#2563EB] transition-colors group"
                          >
                            <span className="flex items-center gap-2.5 font-semibold text-xs">
                              <span className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              {item.label}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#2563EB] text-white font-medium rounded-br-xs text-xs"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs text-xs"
                    }`}
                  >
                    {/* Clean typography without # or * */}
                    <div className="whitespace-pre-line text-xs leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Official Government Links */}
                    {msg.officialLinks && msg.officialLinks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#2563EB] flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                          Official Reference Links:
                        </span>
                        <div className="space-y-1.5">
                          {msg.officialLinks.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 transition-colors"
                            >
                              <div className="font-bold text-[11px] text-[#2563EB] flex items-center justify-between">
                                <span>{link.title}</span>
                                <ExternalLink className="w-3 h-3 opacity-80" />
                              </div>
                              {link.description && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {link.description}
                                </p>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pragati-GovX Action Shortcuts */}
                    {msg.platformActions && msg.platformActions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.platformActions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => {
                              navigate(act.route);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 rounded-md transition-colors"
                          >
                            <span>{act.title}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-[#2563EB]" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-xs text-slate-600 text-xs w-fit">
                <Compass className="w-4 h-4 text-[#2563EB] animate-spin" />
                <span className="font-medium">Startup Mitra is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask Startup Mitra..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded-xl transition-colors"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400">
              Statutory guidance based on GFR 2017 & DPIIT directives.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
