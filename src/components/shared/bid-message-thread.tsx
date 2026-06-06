"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";

import {
  getBidMessages,
  sendBidMessageAction,
  type BidMessage,
} from "@/app/actions/bid-messages";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface BidMessageThreadProps {
  bidId: string;
  currentUserId: string;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export function BidMessageThread({ bidId, currentUserId }: BidMessageThreadProps) {
  const [messages, setMessages] = useState<BidMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages
  useEffect(() => {
    getBidMessages(bidId).then(setMessages);
  }, [bidId]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bid-messages-${bidId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bid_messages",
          filter: `bid_id=eq.${bidId}`,
        },
        (payload) => {
          const row = payload.new as BidMessage;
          // Skip if it's our own optimistic message (already in list)
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === row.id);
            return exists ? prev : [...prev, row];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bidId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const body = input.trim();
    if (!body || isPending) return;

    setInput("");
    setError(null);

    // Optimistic insert
    const optimistic: BidMessage = {
      id: `optimistic-${Date.now()}`,
      bid_id: bidId,
      sender_id: currentUserId,
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("bid_id", bidId);
      fd.set("body", body);
      const result = await sendBidMessageAction({ status: "idle", message: "" }, fd);
      if (result.status === "error") {
        // Roll back optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError(result.message);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Message thread */}
      <div className="flex h-72 flex-col gap-2 overflow-y-auto rounded-2xl bg-surface-soft p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-stone-400">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}
                key={msg.id}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                    isMine
                      ? "rounded-br-sm bg-stone-950 text-white"
                      : "rounded-bl-sm bg-white text-stone-900 shadow-sm ring-1 ring-line",
                  )}
                >
                  {msg.body}
                </div>
                <span className="px-1 text-xs text-stone-400">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <textarea
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 outline-none placeholder:text-stone-400"
          disabled={isPending}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          value={input}
        />
        <button
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white transition hover:bg-rose-600 disabled:opacity-50"
          disabled={!input.trim() || isPending}
          onClick={handleSend}
          type="button"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
