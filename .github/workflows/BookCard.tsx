
import React, { useState, useEffect } from 'react';
import { BookRecommendation } from '../types';
import { BookIcon } from './Icons';

interface BookCardProps {
  book: BookRecommendation;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Simple hash function to generate a consistent seed for picsum.photos
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const seed = hashCode(book.title + book.author);
  const placeholderUrl = `https://picsum.photos/seed/${seed}/400/600`;

  useEffect(() => {
    const findCoverUrl = (data: any): string | null => {
        const bookWithCover = data.docs.find((doc: any) => doc.cover_i);
        return bookWithCover ? `https://covers.openlibrary.org/b/id/${bookWithCover.cover_i}-L.jpg` : null;
    };
  
    const fetchBookCover = async () => {
      setLoading(true);
      let foundUrl: string | null = null;
      try {
          const titleQuery = encodeURIComponent(book.title);
          const authorQuery = encodeURIComponent(book.author);

          // Attempt 1: Search with Title and Author
          const responseWithAuthor = await fetch(`https://openlibrary.org/search.json?title=${titleQuery}&author=${authorQuery}`);
          if (responseWithAuthor.ok) {
              const data = await responseWithAuthor.json();
              foundUrl = findCoverUrl(data);
          }

          // Attempt 2: If no cover found, search with Title only
          if (!foundUrl) {
              const responseWithTitleOnly = await fetch(`https://openlibrary.org/search.json?title=${titleQuery}`);
              if (responseWithTitleOnly.ok) {
                  const data = await responseWithTitleOnly.json();
                  foundUrl = findCoverUrl(data);
              }
          }
          
          setImageUrl(foundUrl || placeholderUrl);

      } catch (error) {
          console.error("Failed to fetch book cover for:", book.title, error);
          setImageUrl(placeholderUrl);
      } finally {
          setLoading(false);
      }
    };

    fetchBookCover();
  }, [book.title, book.author, placeholderUrl]);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
        {loading ? (
          <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
            <BookIcon className="w-12 h-12 text-slate-400 opacity-60" />
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={`Cover for ${book.title}`} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // In case the Open Library URL is broken, fall back to placeholder
              if (imageUrl !== placeholderUrl) {
                (e.target as HTMLImageElement).src = placeholderUrl;
              }
            }}
          />
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold font-serif text-amber-900">{book.title}</h3>
        <p className="text-sm text-slate-600 mb-1">by {book.author}</p>
        <p className="text-xs font-semibold uppercase text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 self-start mb-3">{book.genre}</p>
        <p className="text-sm text-slate-700 flex-grow">{book.synopsis}</p>
      </div>
    </div>
  );
};

export default BookCard;
