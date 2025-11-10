
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  synopsis: string;
}
