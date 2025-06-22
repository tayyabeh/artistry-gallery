import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Smile, Image as ImageIcon, Send, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Draggable from 'react-draggable';

const MessageInput: React.FC = () => {
  const { sendMessage } = useChat();
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click or Esc
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPicker(false);
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showPicker]);

  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !fileRef.current?.files?.length) return;
    const file = fileRef.current?.files?.[0];
    await sendMessage(text.trim(), file);
    setText('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <form onSubmit={handleSend} className="relative flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-700">
      <button type="button" onClick={() => setShowPicker(!showPicker)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
        <Smile size={20} />
      </button>
      {showPicker && (
        <Draggable handle=".drag-handle">
          <div ref={panelRef} className="absolute bottom-20 left-3 z-50 shadow-lg bg-white dark:bg-slate-800 rounded-md p-2 w-72">
            <div className="flex items-center justify-between mb-1 drag-handle">
              <span className="text-xs text-slate-500 dark:text-slate-400">Emoji</span>
              <button type="button" onClick={() => setShowPicker(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={14} />
              </button>
            </div>
            <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} theme="auto" height={350} width="100%" />
          </div>
        </Draggable>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        className="hidden"
        id="upload-img-input"
      />
      <label htmlFor="upload-img-input" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
        <ImageIcon size={20} />
      </label>

      <input
        className="flex-1 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full">
        <Send size={18} />
      </button>
    </form>
  );
};

export default MessageInput;
