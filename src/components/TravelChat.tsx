import { useState } from 'react';
import { ArrowRight, Plane, MapPin, Film, Calendar, Sparkles } from 'lucide-react';
import type { Message, TravelParams } from '../types';
import FloatingTrips from './FloatingTrips';
import { getStoriesForDestination, getDestinationForStory } from '../data/storyDestinations';

export default function TravelChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [travelParams, setTravelParams] = useState<TravelParams>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const addMessage = (
    role: 'user' | 'assistant',
    content: string,
    suggestions?: string[],
    type: 'text' | 'itinerary' | 'suggestions' = 'text'
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      suggestions,
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
    if (!showMessages) setShowMessages(true);
  };

  const extractInfo = (text: string) => {
    const lowerText = text.toLowerCase();

    const dayPatterns = [/(\d+)\s*days?/i, /for\s+(\d+)\s*days?/i, /(\d+)-day/i];
    let duration = '';
    for (const pattern of dayPatterns) {
      const match = text.match(pattern);
      if (match) {
        duration = `${match[1]} days`;
        break;
      }
    }

    let destination = '';
    const destMatch = text.match(
      /(?:to|in|visit|explore|see)\s+([A-Z][a-zA-Z\s]+?)(?:\s+for|\s+\d+|$|,|\.|!|\?)/i
    );
    if (destMatch) {
      destination = destMatch[1].trim();
    }

    const storyKeywords = [
      'Harry Potter',
      'Emily in Paris',
      'Sherlock',
      'Lord of the Rings',
      'Game of Thrones',
      'Bridgerton',
      'Money Heist',
      'Breaking Bad',
      'Friends',
      'Narcos',
      'Vikings',
      'Frida',
      'Romeo',
      'Juliet',
    ];

    let story = '';
    for (const keyword of storyKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        story = keyword;
        break;
      }
    }

    return { destination, duration, story };
  };

  const generateItinerary = async () => {
    setIsLoading(true);
    addMessage(
      'assistant',
      `Perfect! Let me craft your ${travelParams.story ? `${travelParams.story}-inspired` : ''} journey to ${travelParams.destination}...`
    );

    try {
      const response = await fetch('http://localhost:8081/api/itinerary/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: travelParams.destination,
          inspiration: travelParams.story || 'none',
          travelerType: travelParams.travelStyle || 'explorer',
          duration: travelParams.duration || '3 days',
          interests: travelParams.story || 'culture, sightseeing',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();

      const itineraryText = `🎬 Your ${travelParams.story || 'Cultural'} Adventure in ${travelParams.destination}

${travelParams.duration || '3 days'} of unforgettable experiences

${JSON.stringify(data, null, 2)}

✨ Ready to embark on this journey?`;

      addMessage('assistant', itineraryText, ['Save my guide', 'Send to email', 'Start over'], 'itinerary');
    } catch (error) {
      addMessage(
        'assistant',
        "I'm having trouble connecting to create your itinerary. Let me know if you'd like to try again or adjust your plans!"
      );
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage(suggestion);
  };

  const handleSendMessage = (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    addMessage('user', messageToSend);
    setInput('');

    setTimeout(() => {
      processUserInput(messageToSend);
    }, 500);
  };

  const processUserInput = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('save') || lowerInput.includes('email') || lowerInput.includes('start over')) {
      if (lowerInput.includes('start over')) {
        setTravelParams({});
        setMessages([]);
        setShowMessages(false);
        return;
      } else if (lowerInput.includes('save')) {
        addMessage('assistant', '✅ Your guide has been saved! You can access it anytime from your Kultrip dashboard.');
        return;
      } else if (lowerInput.includes('email')) {
        addMessage('assistant', '📧 Great! What email should I send your personalized guide to?');
        return;
      }
    }

    const extracted = extractInfo(userInput);

    if (extracted.destination) {
      setTravelParams((prev) => ({ ...prev, destination: extracted.destination }));
    }
    if (extracted.duration) {
      setTravelParams((prev) => ({ ...prev, duration: extracted.duration }));
    }
    if (extracted.story) {
      setTravelParams((prev) => ({ ...prev, story: extracted.story }));
    }

    const currentParams = {
      ...travelParams,
      ...Object.fromEntries(
        Object.entries({
          destination: extracted.destination,
          duration: extracted.duration,
          story: extracted.story,
        }).filter(([_, v]) => v)
      ),
    };

    if (currentParams.destination && currentParams.story) {
      if (currentParams.duration) {
        setTravelParams(currentParams);
        generateItinerary();
      } else {
        setTravelParams(currentParams);
        addMessage(
          'assistant',
          `Excellent choice! ${currentParams.story} in ${currentParams.destination} will be magical. How many days would you like to spend there?`,
          ['1 day', '2 days', '3 days'],
          'suggestions'
        );
      }
      return;
    }

    if (currentParams.destination && !currentParams.story) {
      const stories = getStoriesForDestination(currentParams.destination);

      if (stories && stories.length > 0) {
        const funFact = getFunFact(currentParams.destination);
        const storyList = stories.slice(0, 5).map((s) => s.story);

        addMessage(
          'assistant',
          `${currentParams.destination} — perfect choice! ${funFact}

It's home to many amazing stories: ${storyList.join(', ')}...

Would you like to explore one of these stories, or just the city itself?`,
          [...storyList, 'Just the city'],
          'suggestions'
        );
        setTravelParams(currentParams);
        return;
      } else {
        if (!currentParams.duration) {
          addMessage(
            'assistant',
            `${currentParams.destination} sounds wonderful! How many days are you planning to stay?`,
            ['1 day', '2 days', '3 days', '1 week'],
            'suggestions'
          );
          setTravelParams(currentParams);
        } else {
          setTravelParams(currentParams);
          generateItinerary();
        }
        return;
      }
    }

    if (currentParams.story && !currentParams.destination) {
      const suggestedDest = getDestinationForStory(currentParams.story);
      if (suggestedDest) {
        setTravelParams({ ...currentParams, destination: suggestedDest });
        addMessage(
          'assistant',
          `${currentParams.story} — what a great choice! The best place to experience this is ${suggestedDest}. How many days would you like to spend there?`,
          ['1 day', '2 days', '3 days'],
          'suggestions'
        );
      } else {
        addMessage('assistant', `I love ${currentParams.story}! Which destination were you thinking for this adventure?`);
      }
      return;
    }

    if (lowerInput.includes('just the city') || lowerInput.includes('city itself')) {
      if (currentParams.destination) {
        if (currentParams.duration) {
          setTravelParams({ ...currentParams, story: undefined });
          generateItinerary();
        } else {
          addMessage(
            'assistant',
            `Perfect! A pure ${currentParams.destination} experience. How many days would you like?`,
            ['1 day', '2 days', '3 days', '1 week'],
            'suggestions'
          );
        }
      }
      return;
    }

    if (!currentParams.destination && !currentParams.story) {
      addMessage(
        'assistant',
        "I'd love to help you plan an unforgettable story-inspired journey! Where would you like to go, or what story inspires your travels?"
      );
    }
  };

  const getFunFact = (destination: string): string => {
    const facts: { [key: string]: string } = {
      London: 'Did you know London has been the backdrop for over 10,000 films?',
      Paris: 'Paris is home to over 130 museums and countless romantic stories!',
      'New Zealand': "It's where Middle-earth came to life!",
      Mexico: 'Mexican culture inspired Pixar\'s most colorful adventure!',
      Iceland: "The land of fire and ice — it's as dramatic as any fantasy epic.",
      Italy: 'Every corner tells a cinematic story.',
      Japan: 'Ancient traditions meet futuristic dreams.',
    };
    return facts[destination] || 'This destination has inspired countless stories!';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPlaceholder = () => {
    if (messages.length === 0) {
      return 'Where would you like to go? Or what story inspires you?';
    }
    return 'Type your answer...';
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <FloatingTrips />
      <header className="border-b border-gray-200 px-6 py-4 relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src="/icone-roxo.png" alt="Kultrip Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Kultrip</h1>
            <p className="text-xs text-gray-500">Story-inspired travel guides</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto relative z-10">
        {!showMessages ? (
          <div className="max-w-3xl w-full text-center mb-8">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <img src="/icone-roxo.png" alt="Kultrip" className="w-24 h-24 relative" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Travel through your favorite stories
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Tell me where you want to go or what story inspires you, and I'll create a personalized cultural guide just for you.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl w-full py-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'w-full'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-900">KultripGPT</span>
                    </div>
                  )}
                  <div
                    className={`${
                      message.role === 'user'
                        ? 'bg-gray-900 text-white rounded-3xl px-6 py-3'
                        : 'text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 rounded-full text-sm font-medium transition-colors border border-gray-200 hover:border-orange-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`max-w-3xl w-full ${showMessages ? 'pb-8' : ''}`}>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-200 rounded-full resize-none focus:outline-none focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors shadow-sm hover:border-gray-300"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '120px' }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {!showMessages && (
            <div className="text-center text-sm text-gray-500 mt-4 space-y-2">
              <p className="font-medium">Try these:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleSuggestionClick('Harry Potter in London')}
                  className="px-3 py-1 bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-full text-xs transition-colors"
                >
                  <Film className="w-3 h-3 inline mr-1" />
                  Harry Potter in London
                </button>
                <button
                  onClick={() => handleSuggestionClick('I want to visit Paris for 3 days')}
                  className="px-3 py-1 bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-full text-xs transition-colors"
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Paris for 3 days
                </button>
                <button
                  onClick={() => handleSuggestionClick('Lord of the Rings adventure')}
                  className="px-3 py-1 bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-full text-xs transition-colors"
                >
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Lord of the Rings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
