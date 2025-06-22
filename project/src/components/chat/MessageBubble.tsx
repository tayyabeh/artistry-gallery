import React from 'react';
import { ChatMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface Props {
  msg: ChatMessage;
}

const MessageBubble: React.FC<Props> = ({ msg }) => {
  const { user } = useAuth();
  const isOwn = user?.id === msg.sender.id;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1 px-2`}>      
      <div
        className={`max-w-[75%] rounded-lg p-2 text-sm whitespace-pre-wrap break-words ${
          isOwn ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50'
        }`}
      >
        {msg.mediaUrl && msg.mediaType === 'image' && (
          <img src={msg.mediaUrl} alt="attachment" className="rounded-md mb-1 max-w-full" />
        )}
        {msg.content && <span>{msg.content}</span>}
        <div className="text-[10px] opacity-70 mt-1 text-right">
          {format(new Date(msg.createdAt), 'p')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
