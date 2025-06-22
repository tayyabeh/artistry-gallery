import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { artCategories } from '../data/mockData';
import { X, Upload as UploadIcon } from 'lucide-react';
import { MarketplaceItem, User } from '../types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const Sell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [price, setPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFiles([file]);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (!title) {
      setTitle(file.name.split('.')[0].replace(/[-_]/g, ' '));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    multiple: false,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
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

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSell = async () => {
    if (!user || files.length === 0 || !title.trim() || !category || !price) return;
    try {
      setIsSubmitting(true);
      const fileBase64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(files[0]);
      });

      const newItem: MarketplaceItem = {
        id: generateId(),
        title,
        description,
        image: fileBase64,
        creator: user as User,
        likes: 0,
        views: 0,
        comments: [],
        downloads: 0,
        tags,
        category,
        createdAt: new Date().toISOString(),
        price: Number(price),
        currency: 'USD',
        inStock: true,
      } as unknown as MarketplaceItem;

      const stored = localStorage.getItem('user_marketplace_items');
      const existing: MarketplaceItem[] = stored ? JSON.parse(stored) : [];
      existing.push(newItem);
      localStorage.setItem('user_marketplace_items', JSON.stringify(existing));
      
      alert('Your artwork has been listed!');
      navigate('/marketplace');
    } catch (error) {
      console.error('Failed to sell item:', error);
      alert('There was an error listing your item. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">List Your Artwork for Sale</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Fill out the details below to put your artwork on the marketplace.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center h-full">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
                    <button onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div {...getRootProps()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <input {...getInputProps()} />
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                      <UploadIcon size={32} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Artwork title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                    placeholder="Artwork description"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input w-full">
                      <option value="" disabled>Select a category</option>
                      {artCategories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Price in PKR"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
                  <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg">
                    {tags.map(tag => (
                      <div key={tag} className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-sm font-medium px-2 py-1 rounded-full">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)}><X size={14} /></button>
                      </div>
                    ))}
                    <input 
                      type="text" 
                      value={currentTag} 
                      onChange={(e) => setCurrentTag(e.target.value)} 
                      onKeyDown={handleTagAdd} 
                      className="flex-grow bg-transparent focus:outline-none p-1"
                      placeholder={tags.length < 5 ? 'Add up to 5 tags...' : '5 tags max'}
                      disabled={tags.length >= 5}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4">
              <button onClick={() => navigate('/marketplace')} className="btn-secondary">Cancel</button>
              <button onClick={handleSell} className="btn-primary" disabled={isSubmitting || !files.length || !title || !category || !price}>
                {isSubmitting ? 'Submitting...' : 'List for Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sell;
