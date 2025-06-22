import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import { getAvatarUrl } from '../../utils/avatar';
import MessageInput from './MessageInput';

const ChatWindow: React.FC = () => {
  const { selectedConversation, messages } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Select a chat to start messaging.
      </div>
    );
  }

  const partner = selectedConversation.participants[0];

  return (
    <section className="flex-1 h-full flex flex-col min-h-0">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <img
          src={getAvatarUrl(partner)}
          alt={partner.username}
          className="w-8 h-8 rounded-full"
        />
        <h2 className="font-medium text-sm text-slate-800 dark:text-slate-100">
          {partner.displayName || partner.username}
        </h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 bg-chat-pattern dark:bg-chat-pattern-dark scrollbar-thin">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <MessageInput />
      </div>
    </section>
  );
};

export default ChatWindow;
