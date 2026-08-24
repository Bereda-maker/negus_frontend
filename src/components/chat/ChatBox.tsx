'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { getSocket } from '@/services/socket';
import Avatar from '@/components/ui/Avatar';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessage {
  _id: string;
  text: string;
  createdAt: string;
  sender: {
    _id: string;
    name: string;
    avatar?: { url: string } | null;
  };
  receiver: string;
}

interface ChatBoxProps {
  userId: string;
  productId?: string | null;
  onClose?: () => void;
}

export default function ChatBox({ userId, productId, onClose }: ChatBoxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/conversation/${userId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    api.patch(`/messages/read/${userId}`);
    if (socket) {
      socket.emit('mark_read', userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg: ChatMessage) => {
      if (msg.sender._id === userId || msg.receiver === userId) {
        setMessages((prev) => [...prev, msg]);
        if (msg.sender._id !== user?.id) {
          api.patch(`/messages/read/${userId}`);
          socket.emit('mark_read', userId);
        }
      }
    };
    socket.on('new_message', onNewMessage);
    return () => {
      socket.off('new_message', onNewMessage);
    };
  }, [socket, userId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post('/messages', {
        receiverId: userId,
        text: newMessage.trim(),
        productId: productId || null,
      });
      const msg = res.data.data;
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      if (socket) {
        socket.emit('private_message', {
          receiverId: userId,
          text: msg.text,
          productId: productId || null,
        });
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full max-h-[500px] bg-white rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-cream flex justify-between items-center">
        <span className="font-semibold text-primary">Chat</span>
        {onClose && (
          <button onClick={onClose} className="text-textSecondary hover:text-primary">
            ✕
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-textSecondary text-sm text-center">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender._id === user?.id;
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-xl ${
                    isMine ? 'bg-gold text-white' : 'bg-warm-bg text-textPrimary'
                  }`}
                >
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1 text-xs font-medium text-textSecondary">
                      <Avatar src={msg.sender.avatar?.url} name={msg.sender.name} size="sm" />
                      {msg.sender.name}
                    </div>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2 bg-cream">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-gold hover:bg-gold-dark text-white p-2 rounded-full disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
