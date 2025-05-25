import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, X, Image as ImageIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { artCategories } from '../data/mockData';

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

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
    setFiles([]);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-8">Create New Pin</h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Upload Section */}
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                {files.length > 0 ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(files[0])}
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
                  className="input w-full h-32 resize-none"
                />
              </div>

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
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagAdd}
                    placeholder="Add tags (press Enter)"
                    className="input w-full"
                  />
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
                  </div>
                </div>
              </div>

              <button
                className="btn-primary w-full mt-8"
                disabled={!files.length || !title.trim() || !category}
              >
                Create Pin
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Upload;