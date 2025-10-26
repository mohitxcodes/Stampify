import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface FilePreview {
    file: File;
    preview: string;
}

export default function UploadSection() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState<FilePreview | null>(null);
    const [logoFile, setLogoFile] = useState<FilePreview | null>(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File, type: 'image' | 'logo') => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const preview = URL.createObjectURL(file);
        const filePreview = { file, preview };

        if (type === 'image') {
            if (imageFile) URL.revokeObjectURL(imageFile.preview);
            setImageFile(filePreview);
        } else {
            if (logoFile) URL.revokeObjectURL(logoFile.preview);
            setLogoFile(filePreview);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>, type: 'image' | 'logo') => {
        e.preventDefault();
        if (type === 'image') setIsDraggingImage(true);
        else setIsDraggingLogo(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>, type: 'image' | 'logo') => {
        e.preventDefault();
        if (type === 'image') setIsDraggingImage(false);
        else setIsDraggingLogo(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'image' | 'logo') => {
        e.preventDefault();
        if (type === 'image') setIsDraggingImage(false);
        else setIsDraggingLogo(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0], type);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'logo') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0], type);
        }
    };

    const handleRemove = (type: 'image' | 'logo') => {
        if (type === 'image' && imageFile) {
            URL.revokeObjectURL(imageFile.preview);
            setImageFile(null);
            if (imageInputRef.current) imageInputRef.current.value = '';
        } else if (type === 'logo' && logoFile) {
            URL.revokeObjectURL(logoFile.preview);
            setLogoFile(null);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    const handleProcess = async () => {
        if (!imageFile || !logoFile) {
            alert('Please upload both an image and a logo');
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append('main_image', imageFile.file);
        formData.append('watermark_image', logoFile.file);

        try {
            // 🔗 Send request to Flask backend
            const response = await fetch('http://127.0.0.1:5001/add_watermark', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process image');
            }

            // 🖼 Convert Flask response (image blob) to an image URL
            const blob = await response.blob();
            const watermarkedImageUrl = URL.createObjectURL(blob);

            // 🧭 Navigate to output page with result
            navigate('/output', {
                state: {
                    watermarkedImage: watermarkedImageUrl,
                    originalFileName: `watermarked-${imageFile.file.name}`,
                },
            });
        } catch (error) {
            console.error('Error processing images:', error);
            alert('Something went wrong while processing the image.');
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-indigo-100 shadow-sm mb-4">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">AI-Powered Watermarking</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                        Create Stunning Watermarked Images
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform your images with professional watermarks in seconds. ✨
                    </p>
                </div>

                {/* Upload Cards */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
                    {/* Image Upload */}
                    <div className="group bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-white/20">
                        <div className="flex items-center mb-6 space-x-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    Main Image
                                    <span className="ml-2 text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">Step 1</span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Upload the image to watermark</p>
                            </div>
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragEnter={(e) => handleDragEnter(e, 'image')}
                            onDragLeave={(e) => handleDragLeave(e, 'image')}
                            onDrop={(e) => handleDrop(e, 'image')}
                            onClick={() => imageInputRef.current?.click()}
                            className={`relative border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDraggingImage
                                ? 'border-indigo-500 bg-indigo-50 scale-105'
                                : imageFile
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleInputChange(e, 'image')}
                                className="hidden"
                            />

                            {imageFile ? (
                                <div className="space-y-4">
                                    <img
                                        src={imageFile.preview}
                                        alt="Preview"
                                        className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
                                    />
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-700">{imageFile.file.name}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove('image');
                                        }}
                                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-700 mb-1">
                                            Drop your image here
                                        </p>
                                        <p className="text-sm text-gray-500">or click to browse</p>
                                    </div>
                                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">Logo</h2>
                                <p className="text-sm text-gray-500">Upload your watermark logo</p>
                            </div>
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragEnter={(e) => handleDragEnter(e, 'logo')}
                            onDragLeave={(e) => handleDragLeave(e, 'logo')}
                            onDrop={(e) => handleDrop(e, 'logo')}
                            onClick={() => logoInputRef.current?.click()}
                            className={`relative border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDraggingLogo
                                ? 'border-purple-500 bg-purple-50 scale-105'
                                : logoFile
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleInputChange(e, 'logo')}
                                className="hidden"
                            />

                            {logoFile ? (
                                <div className="space-y-4">
                                    <img
                                        src={logoFile.preview}
                                        alt="Logo Preview"
                                        className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
                                    />
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-700">{logoFile.file.name}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove('logo');
                                        }}
                                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-700 mb-1">
                                            Drop your logo here
                                        </p>
                                        <p className="text-sm text-gray-500">or click to browse</p>
                                    </div>
                                    <p className="text-xs text-gray-400">PNG (transparent) recommended</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Process Button */}
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        {imageFile && logoFile && !isProcessing && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                        )}
                        <button
                            onClick={handleProcess}
                            disabled={!imageFile || !logoFile || isProcessing}
                            className={`relative px-12 py-5 rounded-2xl font-bold text-lg transition-all duration-500 transform ${imageFile && logoFile && !isProcessing
                                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:scale-105 shadow-2xl hover:shadow-3xl active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-md'
                                }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center space-x-3">
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing Magic...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center space-x-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    <span>✨ Apply Watermark</span>
                                </span>
                            )}
                        </button>
                    </div>

                    {(!imageFile || !logoFile) && (
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">
                                Please upload both an image and a logo to continue
                            </p>
                        </div>
                    )}

                    {imageFile && logoFile && !isProcessing && (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-emerald-700">Ready to process!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
