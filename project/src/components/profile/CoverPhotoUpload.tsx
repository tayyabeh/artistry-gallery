import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoverPhotoUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

const CoverPhotoUpload: React.FC<CoverPhotoUploadProps> = ({
  currentImage,
  onImageChange,
  disabled = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageChange(e.target.files[0]);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {currentImage ? (
        <img 
          src={currentImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
      )}
      
      <AnimatePresence>
        {isHovered && !disabled && (
          <motion.div 
            className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label className="bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
              <Camera size={16} />
              Change Cover
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
              />
            </label>
            
            {currentImage && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="ml-2 bg-white/90 hover:bg-white text-red-600 p-1.5 rounded-full shadow-sm transition-colors"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoverPhotoUpload;
