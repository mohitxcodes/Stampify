import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
    watermarkedImage?: string;
    originalFileName?: string;
}

export default function OutputPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const watermarkedImage = state?.watermarkedImage;
    const originalFileName = state?.originalFileName || 'watermarked-image.png';
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Show success animation when component mounts
        setShowSuccess(true);
    }, []);

    const handleDownload = async () => {
        if (!watermarkedImage) return;

        setIsDownloading(true);

        try {
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = watermarkedImage;
            link.download = originalFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show success feedback
            setTimeout(() => setIsDownloading(false), 500);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image');
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!watermarkedImage) return;

        try {
            // Check if Web Share API is available
            if (navigator.share) {
                const response = await fetch(watermarkedImage);
                const blob = await response.blob();
                const file = new File([blob], originalFileName, { type: blob.type });

                await navigator.share({
                    files: [file],
                    title: 'Watermarked Image',
                    text: 'Check out my watermarked image!'
                });
            } else {
                alert('Sharing is not supported on this browser');
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleStartOver = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Success Header */}
                <div className={`text-center mb-12 transition-all duration-700 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg animate-bounce">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Watermark Applied Successfully!
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your image has been processed and is ready to download.
                        Preview it below and save it to your device.
                    </p>
                </div>

                {/* Preview Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Preview</h2>
                            <p className="text-sm text-gray-500">Your watermarked image</p>
                        </div>
                    </div>

                    {/* Image Preview */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
                        {watermarkedImage ? (
                            <img
                                src={watermarkedImage}
                                alt="Watermarked Preview"
                                className="max-w-full max-h-[600px] mx-auto rounded-lg shadow-lg object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">No image available</p>
                            </div>
                        )}
                    </div>

                    {/* Image Info */}
                    <div className="flex items-center justify-between p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{originalFileName}</p>
                                <p className="text-xs text-gray-500">Ready to download</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Processed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <button
                        onClick={handleDownload}
                        disabled={!watermarkedImage || isDownloading}
                        className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:from-indigo-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download Image</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleShare}
                        disabled={!watermarkedImage}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:bg-indigo-50 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Share</span>
                    </button>

                    <button
                        onClick={handleStartOver}
                        className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:bg-gray-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Start Over</span>
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">High Quality</h3>
                        <p className="text-gray-600 text-sm">Original image quality preserved with professional watermark</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Processing</h3>
                        <p className="text-gray-600 text-sm">Your images are processed securely and not stored</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Download</h3>
                        <p className="text-gray-600 text-sm">Download your watermarked image immediately</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
