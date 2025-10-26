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
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Image Watermark Tool
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload your image and logo to create a professional watermarked image.
                        Simply drag and drop or click to browse.
                    </p>
                </div>

                {/* Upload Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Image Upload */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">Main Image</h2>
                                <p className="text-sm text-gray-500">Upload the image to watermark</p>
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
                <div className="text-center">
                    <button
                        onClick={handleProcess}
                        disabled={!imageFile || !logoFile || isProcessing}
                        className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${imageFile && logoFile && !isProcessing
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Apply Watermark
                            </span>
                        )}
                    </button>

                    {(!imageFile || !logoFile) && (
                        <p className="mt-4 text-sm text-gray-500">
                            Please upload both an image and a logo to continue
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
