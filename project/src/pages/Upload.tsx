import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, X, Image as ImageIcon, Sparkles, LinkIcon, Globe, Lock, User, Users, Clock, Palette, Wand2, TextCursorInput } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { artworkAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { artCategories } from '../data/mockData';

enum UploadMode {
  FILE = 'file',
  AI = 'ai'
}

enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS = 'followers'
}

const Upload: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  // Upload states
  const [uploadMode, setUploadMode] = useState<UploadMode>(UploadMode.FILE);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Image details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PUBLIC);
  const [collection, setCollection] = useState('');
  const [addToCollection, setAddToCollection] = useState(false);
  
  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFiles([file]);
    
    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Auto-detect title from filename
    const fileName = file.name.split('.')[0].replace(/[-_]/g, ' ');
    if (!title) {
      setTitle(fileName);
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  // Clean up any object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFiles([]);
    setPreviewUrl(null);
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // If user selected a specific art style, append it to the prompt for Stable Diffusion
      const styleAddon = aiStyle && aiStyle !== 'photorealistic' ? ` in ${aiStyle} style` : '';
      const promptToSend = `${aiPrompt}${styleAddon}`;

      const res = await aiAPI.generateImage(promptToSend);
      const img = res.data.image;
      setGeneratedImages([img]);
      setSelectedGeneratedImage(0);
      setPreviewUrl(img);
      // Pre-fill title
      if (!title) {
        setTitle(aiPrompt.split(' ').slice(0, 5).join(' '));
      }
    } catch (err) {
      console.error('AI generate error', err);
      alert('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setIsSubmitting(true);
            let payload: Record<string, any>;

      if (uploadMode === UploadMode.FILE && files.length) {
        // convert file to base64 string
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(files[0]);
        });
        payload = { image: fileBase64 };
      } else if (uploadMode === UploadMode.AI && selectedGeneratedImage !== null) {
        payload = { image: generatedImages[selectedGeneratedImage] };
      } else {
        alert('Please select an image first');
        return;
      }

      payload = {
        ...payload,
        title,
        description,
        category,
        tags,
        visibility
      };

      await artworkAPI.createArtwork(payload);
      await refreshUser();
      navigate('/profile');
    } catch (err) {
      console.error('Failed to upload artwork', err);
      const msg = (err as any)?.response?.data?.message || 'Failed to upload artwork';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

const selectGeneratedImage = (index: number) => {
    setSelectedGeneratedImage(index);
    setPreviewUrl(generatedImages[index]);
  };

  const aiStyleOptions = [
    { id: 'photorealistic', label: 'Photorealistic' },
    { id: 'digital-art', label: 'Digital Art' },
    { id: 'anime', label: 'Anime' },
    { id: 'watercolor', label: 'Watercolor' },
    { id: 'oil-painting', label: 'Oil Painting' },
    { id: 'pixel-art', label: 'Pixel Art' },
    { id: 'sketch', label: 'Sketch' },
    { id: 'abstract', label: 'Abstract' }
  ];

  const collections = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'inspiration', label: 'Inspiration' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'ideas', label: 'Ideas' }
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-8">Create New Pin</h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setUploadMode(UploadMode.FILE)}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                uploadMode === UploadMode.FILE
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UploadIcon size={18} />
                <span>Upload Image</span>
              </div>
            </button>
            
            <button
              onClick={() => setUploadMode(UploadMode.AI)}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                uploadMode === UploadMode.AI
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wand2 size={18} />
                <span>Generate with AI</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Upload/AI Section */}
              <div>
                {uploadMode === UploadMode.FILE ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-96 mx-auto rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadIcon className="w-12 h-12 mx-auto text-slate-400" />
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            We recommend using high quality .jpg files less than 20 MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Describe the image you want to create
                        </label>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="A vibrant digital painting of a futuristic city with flying cars and neon lights..."
                          className="input w-full h-24 resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Art Style</label>
                        <select
                          value={aiStyle}
                          onChange={(e) => setAiStyle(e.target.value)}
                          className="input w-full"
                        >
                          {aiStyleOptions.map((style) => (
                            <option key={style.id} value={style.id}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        className="btn-primary w-full flex items-center justify-center gap-2"
                        onClick={handleAIGenerate}
                        disabled={!aiPrompt.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <span className="animate-spin mr-2">⌛</span>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Generate Image
                          </>
                        )}
                      </button>
                    </div>
                    
                    {generatedImages.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Generated Images</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {generatedImages.map((img, index) => (
                            <div
                              key={index}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                selectedGeneratedImage === index
                                  ? 'border-primary-500 shadow-md'
                                  : 'border-transparent hover:border-slate-300'
                              }`}
                              onClick={() => selectGeneratedImage(index)}
                            >
                              <img
                                src={img}
                                alt={`Generated image ${index + 1}`}
                                className="w-full aspect-square object-cover"
                              />
                              {selectedGeneratedImage === index && (
                                <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right: Details Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add your title"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell everyone what your Pin is about"
                    className="input w-full h-24 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Select a category</option>
                      {artCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as Visibility)}
                      className="input w-full"
                    >
                      <option value={Visibility.PUBLIC}>
                        Public
                      </option>
                      <option value={Visibility.FOLLOWERS}>
                        Followers Only
                      </option>
                      <option value={Visibility.PRIVATE}>
                        Private
                      </option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="addToCollection"
                      checked={addToCollection}
                      onChange={(e) => setAddToCollection(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="addToCollection" className="text-sm font-medium">
                      Add to Collection
                    </label>
                  </div>
                  
                  {addToCollection && (
                    <select
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      className="input w-full mt-2"
                    >
                      <option value="">Select a collection</option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.label}
                        </option>
                      ))}
                      <option value="new">+ Create new collection</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagAdd}
                        placeholder="Add tags (press Enter)"
                        className="input w-full pl-8"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        #
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm flex items-center"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-error-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      
                      {tags.length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Add a few tags to help people discover your pin (e.g., art, illustration, nature)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {uploadMode === UploadMode.AI ? 'AI-generated image' : 'Original content upload'}
                    </span>
                    <div className="flex space-x-2">
                      {uploadMode === UploadMode.AI && (
                        <span className="flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                          <Sparkles size={14} className="mr-1" />
                          AI
                        </span>
                      )}
                      <span className="flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                        {visibility === Visibility.PUBLIC ? (
                          <Globe size={14} className="mr-1" />
                        ) : visibility === Visibility.PRIVATE ? (
                          <Lock size={14} className="mr-1" />
                        ) : (
                          <Users size={14} className="mr-1" />
                        )}
                        {visibility === Visibility.PUBLIC
                          ? 'Public'
                          : visibility === Visibility.PRIVATE
                          ? 'Private'
                          : 'Followers'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCreatePin}
                    className="btn-primary w-full mt-8 disabled:opacity-50"
                    disabled={isSubmitting || ((!files.length && uploadMode===UploadMode.FILE) && !previewUrl) || !title.trim() || !category}
                  >
                    {isSubmitting ? 'Uploading...' : 'Create Pin'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Upload;