import React, {useState} from 'react';
import {X} from 'lucide-react';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
    previewSize?: 'sm' | 'md' | 'lg';
}

const ImageZoom: React.FC<ImageZoomProps> = ({
                                                 src,
                                                 alt,
                                                 className = '',
                                                 previewSize = 'md'
                                             }) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    };

    const previewClass = sizeClasses[previewSize];

    return (
        <>
            <div
                className={`relative ${previewClass} flex-shrink-0 rounded overflow-hidden border cursor-pointer ${className}`}
                onClick={toggleZoom}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div
                            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                    </div>
                )}

                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-xs text-center px-1">Nie udało się załadować zdjęcia</span>
                    </div>
                )}

                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </div>

            {isZoomed && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
                    onClick={toggleZoom}
                >
                    <div
                        className="relative max-w-4xl max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                            onClick={toggleZoom}
                        >
                            <X size={24}/>
                        </button>
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[90vh] object-contain rounded shadow-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageZoom;