import React, { useState, useEffect } from 'react';
import { Conversation } from '../../types';
import { useChat } from '../../context/ChatContext';
import { authAPI, chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';

interface Props {
  conversations: Conversation[];
}

const ChatList: React.FC<Props> = ({ conversations }) => {
  const { user } = useAuth();
  const { selectedConversation, selectConversation, upsertConversation } = useChat();
  const [term, setTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      const q = term.trim();
      if (q.length < 2) {
        setSearchResults([]);
        return;
      }
      authAPI
        .searchUsers(q)
        .then((res) => setSearchResults(res.data))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(delay);
  }, [term]);

  const filtered = conversations.filter((conv) => {
    const partner = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
    const name = (partner?.displayName || partner?.username || '').toLowerCase();
    return name.includes(term.toLowerCase());
  });

  return (
    <aside className="w-full sm:w-80 border-r border-slate-200 dark:border-slate-700 overflow-y-hidden h-full flex flex-col">      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
          <Search size={16} className="text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search or start chat"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-hidden">
      {/* Existing conversations */}
      {filtered.map((conv) => {
        const partner = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
        const isActive = selectedConversation?.id === conv.id;
        return (
          <button
            key={conv.id}
            onClick={() => selectConversation(conv.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none ${
              isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''
            }`}
          >
            <img
              src={getAvatarUrl(partner)}
              alt={partner.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                {partner.displayName || partner.username}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {conv.lastMessage?.content || (conv.lastMessage?.mediaType ? '📎 Attachment' : 'No messages yet')}
              </div>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
              {conv.lastMessage && formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
            </div>
          </button>
        );
      })}
    {/* Search results */}
      {searchResults.length > 0 && (
        <>
          <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wide">People</div>
          {searchResults.map((u) => (
            <div key={u._id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <img
                src={getAvatarUrl(u)}
                alt={u.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                  {u.displayName || u.username}
                </div>
              </div>
              <button
                onClick={async () => {
                  if (loading) return;
                  setLoading(true);
                  try {
                    const res = await chatAPI.createConversation(u._id);
                    const mappedParticipants = res.data.participants.map((p: any) => ({
                      ...p,
                      id: p.id ?? p._id,
                    }));
                    const conv = {
                      id: res.data._id ?? res.data.id,
                      participants: mappedParticipants,
                      lastMessage: res.data.lastMessage,
                      updatedAt: res.data.updatedAt,
                    } as any;
                    upsertConversation(conv);
                    setTerm('');
                    setSearchResults([]);
                  } catch (err) {
                    console.error('Create conversation error', err);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-primary-600 text-xs font-medium"
              >Chat</button>
            </div>
          ))}
        </>
      )}
    </div></aside>
  );
};

export default ChatList;
