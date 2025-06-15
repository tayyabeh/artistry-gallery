import React, { useState, useRef, ChangeEvent } from 'react';
import { X, Camera, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePhotoUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentImage,
  onImageChange,
  size = 'md',
  className = '',
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onImageChange(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Pass null to indicate removal
    onImageChange(null as unknown as File);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const imageUrl = previewUrl || currentImage;

  return (
    <div className={`relative group ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ${!disabled ? 'cursor-pointer' : 'opacity-70'} relative`}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        onClick={!disabled ? handleClick : undefined}
        aria-disabled={disabled}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <UserIcon size={sizeClasses[size] === 'w-16 h-16' ? 32 : 48} />
          </div>
        )}
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Camera size={iconSizes[size] * 1.5} className="mb-1" />
              <span className="text-xs font-medium">
                {imageUrl ? 'Change photo' : 'Add photo'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {imageUrl && (
          <button 
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            onClick={handleRemovePhoto}
            aria-label="Remove photo"
          >
            <X size={iconSizes[size] / 1.5} />
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Upload profile photo"
      />
    </div>
  );
};

export default ProfilePhotoUpload;
