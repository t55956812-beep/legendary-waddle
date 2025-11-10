import { GoogleGenAI, Type, Chat } from "@google/genai";
import { BookRecommendation, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationModel = 'gemini-2.5-flash';
const chatModel = 'gemini-2.5-flash';

const bookRecommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The title of the book.",
      },
      author: {
        type: Type.STRING,
        description: "The author of the book.",
      },
      genre: {
        type: Type.STRING,
        description: "The primary genre of the book.",
      },
      synopsis: {
        type: Type.STRING,
        description: "A short, compelling synopsis of the book (around 50-70 words)."
      },
    },
    required: ["title", "author", "genre", "synopsis"],
  },
};


export const getInitialQuestion = async (): Promise<string> => {
  const systemInstruction = `You are a friendly AI book recommender. Your goal is to help a user find a book they'll love. Your very first question to the user must be about what genres they typically enjoy reading. Keep the question simple and direct. For example: "What's your favorite book genre?" or "What kind of genres do you usually read?". Ask only one question.`;

  try {
    const response = await ai.models.generateContent({
        model: recommendationModel,
        contents: [{ role: 'user', parts: [{ text: "Ask me your first question." }] }],
        config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    console.error("Error getting initial question:", error);
    return "I'm having a little trouble thinking of a question right now. Could you tell me about a book you've recently enjoyed?";
  }
};


export const getNextQuestion = async (history: ChatMessage[]): Promise<string> => {
    const formattedHistory = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const systemInstruction = `You are a friendly and insightful book recommender AI. Your goal is to ask a series of unique, non-repetitive follow-up questions to deeply understand a user's taste in books.

**Conversation History:**
${formattedHistory}

**Your Task:**
1.  **Analyze the conversation history** to identify the topics already discussed (e.g., genre, pace, tone, setting, character preferences).
2.  **Ask the *next* single, engaging question** that explores a *new* aspect of their preferences.
3.  **Do NOT repeat questions** or ask about topics that are already clear from the user's previous answers.

**Example Topic Areas (choose one that hasn't been covered):**
-   **Pace:** "Are you in the mood for a fast-paced thriller or a slower, more character-focused story?"
-   **Tone/Mood:** "What kind of mood are you looking for in your next read? Something light and funny, or perhaps dark and mysterious?"
-   **Setting:** "Do you prefer books set in the real world, a fantastical realm, or a historical period?"
-   **Protagonist:** "What kind of main character do you enjoy following? A reluctant hero, a clever detective, a flawed anti-hero?"
-   **Likes/Dislikes:** "Is there anything you absolutely want to avoid in a book, like a love triangle or a cliffhanger ending?"
-   **Recent Reads:** "Tell me about a book you've read recently. What did you like or dislike about it?"

Keep your question conversational and directly related to finding the perfect book. Ask only one question.`;

    try {
        const response = await ai.models.generateContent({
            model: recommendationModel,
            contents: [{ role: 'user', parts: [{ text: "Based on our conversation, what's the best follow-up question to ask?" }] }],
            config: { systemInstruction }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting next question:", error);
        return "I seem to be stuck. Could you tell me about your favorite movie? Sometimes that helps!";
    }
};

export const getRecommendations = async (history: ChatMessage[]): Promise<BookRecommendation[]> => {
    const formattedHistory = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const systemInstruction = `You are an expert book recommender. Based on this conversation:\n${formattedHistory}\n\nRecommend 3 distinct books. For each book, provide a title, author, genre, and a short, compelling synopsis.`;
    
    try {
        const response = await ai.models.generateContent({
            model: recommendationModel,
            contents: [{ role: 'user', parts: [{ text: "Please provide the recommendations now." }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: bookRecommendationSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting recommendations:", error);
        // Fallback or error handling
        return [];
    }
};

export const createChat = (): Chat => {
    return ai.chats.create({
        model: chatModel,
        config: {
            systemInstruction: 'You are a helpful and friendly AI assistant. Answer the user\'s questions clearly and concisely.',
        }
    });
};