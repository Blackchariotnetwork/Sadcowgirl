import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface CommentRow {
  id: number;
  name: string;
  text: string;
  likes: number;
  ts: string;
}

const timeAgo = (ts: string) => {
  const d = new Date(ts.replace(' ', 'T') + 'Z').getTime();
  if (isNaN(d)) return '';
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const Comments: React.FC<{ videoId: string }> = ({ videoId }) => {
  const [comments, setComments] = useState<CommentRow[] | null>(null);
  const [name, setName] = useState<string>(() => localStorage.getItem('sc_display_name') || '');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/comments?video=${encodeURIComponent(videoId)}`);
      const j = await r.json();
      setComments(j.comments || []);
    } catch {
      setComments([]);
    }
  }, [videoId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const r = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ videoId, name, text }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.error || 'Could not post comment.');
      } else {
        if (name) localStorage.setItem('sc_display_name', name);
        setComments((prev) => [j as CommentRow, ...(prev || [])]);
        setText('');
      }
    } catch {
      setError('Network error — try again.');
    }
    setSending(false);
  };

  return (
    <div className="mt-6">
      <h3 className="font-varsity text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5 text-[#E07A5F]" /> Corral Talk ({comments?.length ?? '…'})
      </h3>

      <form onSubmit={submit} className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={32}
            className="bg-[#141B2D] border border-[#1E293B] rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E07A5F]/60 w-44"
          />
        </div>
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a comment for the corral…"
            rows={2}
            maxLength={500}
            className="flex-1 bg-[#141B2D] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E07A5F]/60 resize-none"
          />
          <button
            type="submit"
            disabled={sending || text.trim().length < 2}
            className="self-end px-3 py-2 rounded-md bg-[#E07A5F] hover:bg-[#C25D42] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post
          </button>
        </div>
        {error && <p className="text-[11px] font-mono text-red-400 mt-1.5">{error}</p>}
      </form>

      <div className="space-y-3">
        {comments === null && <p className="text-xs font-mono text-slate-500">Loading…</p>}
        {comments?.length === 0 && (
          <p className="text-xs font-mono text-slate-500">No comments yet — be the first voice in the corral.</p>
        )}
        {comments?.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1A2338] border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-300 shrink-0">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-mono">
                <span className="text-[#E07A5F] font-semibold">{c.name}</span>
                <span className="text-slate-600 ml-2">{timeAgo(c.ts)}</span>
              </p>
              <p className="text-xs text-slate-200 leading-relaxed break-words">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};