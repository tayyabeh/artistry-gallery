import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage, Conversation, User } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: ChatMessage[];
  selectConversation: (id: string) => void;
  upsertConversation: (conv: Conversation) => void;
  sendMessage: (text: string, file?: File | null) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateMockData = (currentUser: User | null): { conversations: Conversation[]; messages: Record<string, ChatMessage[]> } => {
  // Cheap helper to pick avatar
  const placeholderAvatar = (name: string) =>
    `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${name}`;

  const otherA: User = {
    id: 'u_alice',
    username: 'alice',
    email: 'alice@example.com',
    createdAt: new Date().toISOString(),
    displayName: 'Alice',
    avatar: placeholderAvatar('Alice')
  } as User;
  const otherB: User = {
    id: 'u_bob',
    username: 'bob',
    email: 'bob@example.com',
    createdAt: new Date().toISOString(),
    displayName: 'Bob',
    avatar: placeholderAvatar('Bob')
  } as User;
  const me = currentUser ?? {
    id: 'me',
    username: 'me',
    email: 'me@example.com',
    createdAt: new Date().toISOString(),
    displayName: 'You'
  } as User;

  const conv1: Conversation = {
    id: 'c1',
    participants: [me, otherA],
    lastMessage: undefined,
    updatedAt: new Date().toISOString()
  };
  const conv2: Conversation = {
    id: 'c2',
    participants: [me, otherB],
    lastMessage: undefined,
    updatedAt: new Date().toISOString()
  };

  const m1: ChatMessage = {
    id: 'm1',
    conversationId: 'c1',
    sender: otherA,
    content: 'Hey! How are you?',
    createdAt: new Date().toISOString()
  };
  const m2: ChatMessage = {
    id: 'm2',
    conversationId: 'c1',
    sender: me,
    content: "I'm good, thanks!",
    createdAt: new Date().toISOString()
  };
  conv1.lastMessage = m2;
  const m3: ChatMessage = {
    id: 'm3',
    conversationId: 'c2',
    sender: otherB,
    content: 'Ready for the meetup tomorrow?',
    createdAt: new Date().toISOString()
  };
  conv2.lastMessage = m3;

  return {
    conversations: [conv1, conv2],
    messages: {
      c1: [m1, m2],
      c2: [m3]
    }
  };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');

  // initialise mock
  useEffect(() => {
    const { conversations: convs, messages } = generateMockData(user);
    setConversations(convs);
    setMessagesMap(messages);
    setSelectedConversationId(convs[0]?.id ?? '');
  }, [user]);

  const selectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const upsertConversation = useCallback((conv: Conversation) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === conv.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = conv;
        return updated;
      }
      return [conv, ...prev];
    });
    setSelectedConversationId(conv.id);
  }, []);

  const sendMessage = useCallback(
    async (text: string, file?: File | null) => {
      if (!selectedConversationId) return;
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        conversationId: selectedConversationId,
        sender: user as User, // assume logged in
        content: text,
        createdAt: new Date().toISOString(),
        mediaUrl: file ? URL.createObjectURL(file) : undefined,
        mediaType: file ? 'image' : undefined
      };
      setMessagesMap((prev) => {
        const arr = prev[selectedConversationId] ? [...prev[selectedConversationId]] : [];
        arr.push(newMsg);
        return { ...prev, [selectedConversationId]: arr };
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt } : c
        )
      );
    },
    [selectedConversationId, user]
  );

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;
  const messages = selectedConversationId ? messagesMap[selectedConversationId] ?? [] : [];

  return (
    <ChatContext.Provider
      value={{
        conversations,
        selectedConversation,
        messages,
        selectConversation,
        upsertConversation,
        sendMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
