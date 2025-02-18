// src/components/ChatInterface/index.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatMessageComponent } from './ChatMessage';
import { ChatOptions } from './ChatOptions';
import { ChatHeader } from './ChatHeader';
import { VideoPlayer } from './VideoPlayer';
import { useChatStore } from '@/store/chatStore';
import { useWeb3 } from '@/components/providers/web3-provider';
import { characters, isValidCharacterId } from '@/data/characters';
import type { MessageContent, ChatMessage } from '@/types/chat';
import Web3 from 'web3';
import { MessageTrackerRef } from '@/components/LocalMessageTracker';
import { MessageStats } from '@/types/messageStore';
import CharacterAccessControl from '@/components/CharacterAccessControl';

export function ChatInterface() {
  // Core state management
  const { selectedCharacter, messages, happiness, currentScene, actions } = useChatStore();
  const { address } = useWeb3();
  const router = useRouter();
  const messageTracker = useRef<MessageTrackerRef>(null);

  // Local UI state
  const [input, setInput] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Access control state
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Message tracking state
  const [messageStats, setMessageStats] = useState<MessageStats>({
    messagesUsed: 0,
    messagesRemaining: 0,
    packagesPurchased: 0
  });

  const character = selectedCharacter && isValidCharacterId(selectedCharacter)
    ? characters[selectedCharacter]
    : null;

  const currentSceneOptions = character?.scenes[currentScene]?.options || [];

  const showErrorMessage = (message: string) => {
    setError(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setError(null);
    }, 5000);
  };

  // Initialize token manager and check access
  useEffect(() => {
    const checkAccess = async () => {
      if (!window.tokenManager?.initialized || !address || !selectedCharacter) {
        setIsCheckingAccess(false);
        setHasAccess(false); // Default to no access
        return;
      }
  
      try {
        setIsCheckingAccess(true);
        const accessResult = await window.tokenManager.checkAccess(selectedCharacter);
        setHasAccess(accessResult.hasAccess);
        
        // If no access, ensure we clear any stale local storage data
        if (!accessResult.hasAccess) {
          const accessKey = `character_access_${address.toLowerCase()}_${selectedCharacter}`;
          localStorage.removeItem(accessKey);
        }
      } catch (error: any) {
        console.error('Failed to check access:', error);
        setError(error.message || 'Failed to verify access status');
        setHasAccess(false); // Default to no access on error
      } finally {
        setIsCheckingAccess(false);
      }
    };
  
    // Just check access if we have a wallet connection
    checkAccess();
  }, [address, selectedCharacter]);;

  // Listen for access status changes
  useEffect(() => {
    const handleAccessChange = (event: Event) => {
      const customEvent = event as CustomEvent<{characterId: string, hasAccess: boolean}>;
      if (customEvent.detail?.characterId === selectedCharacter) {
        setHasAccess(customEvent.detail.hasAccess);
      }
    };
    
    const handleChatCompleted = (event: Event) => {
      const customEvent = event as CustomEvent<{characterId: string}>;
      if (customEvent.detail?.characterId === selectedCharacter) {
        // Make sure access is revoked when chat is completed
        setHasAccess(false);
        // Also clear local storage
        if (address) {
          const accessKey = `character_access_${address.toLowerCase()}_${selectedCharacter}`;
          localStorage.removeItem(accessKey);
        }
      }
    };
  
    window.addEventListener('accessStatusChanged', handleAccessChange);
    window.addEventListener('chatCompleted', handleChatCompleted);
    
    return () => {
      window.removeEventListener('accessStatusChanged', handleAccessChange);
      window.removeEventListener('chatCompleted', handleChatCompleted);
    };
  }, [selectedCharacter, address]);;

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Verifying access...</div>
      </div>
    );
  }


  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  // Audio playback management
  const createAudioElement = (audioBuffer: ArrayBuffer): HTMLAudioElement => {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return audio;
  };

  const playAudio = async (text: string) => {
    if (!text || audioPlaying) return;

    try {
      setAudioPlaying(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: character?.language || 'chinese'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBuffer = await response.arrayBuffer();
      const audio = createAudioElement(audioBuffer);

      audio.onended = () => {
        setAudioPlaying(false);
        URL.revokeObjectURL(audio.src);
      };

      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioPlaying(false);
      showErrorMessage('Failed to play audio. Please try again.');
    }
  };

  // Message handling
  const handleOptionSelect = async (text: string) => {
    setInput(text);
    setShowOptions(false);
  };

  const handlePlayAudio = async (text: string) => {
    if (audioPlaying) return;
    await playAudio(text);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedCharacter || !character || isTransitioning || !address) {
      showErrorMessage('Invalid input or connection state');
      return;
    }
  
    try {
      const selectedOption = currentSceneOptions.find(opt => {
        const primaryText = opt.chinese || opt.japanese || opt.korean || opt.spanish;
        return primaryText === input.trim();
      });
  
      if (!selectedOption) {
        showErrorMessage('Please select a valid response option');
        return;
      }
  
      // Add user message to the chat (this is local, not blockchain)
      const messageContent: MessageContent = {
        english: selectedOption.english,
        chinese: selectedOption.chinese,
        pinyin: selectedOption.pinyin,
        japanese: selectedOption.japanese,
        romaji: selectedOption.romaji,
        korean: selectedOption.korean,
        romanized: selectedOption.romanized,
        spanish: selectedOption.spanish,
        video: selectedOption.video
      };
  
      actions.addMessage({
        role: 'user',
        content: messageContent
      });
  
      // Update happiness locally, no blockchain needed here
      if (typeof selectedOption.points === 'number') {
        actions.updateHappiness(selectedCharacter, selectedOption.points);
        const happinessKey = `lingobabe_happiness_${address.toLowerCase()}_${selectedCharacter}`;
        const currentHappiness = happiness[selectedCharacter] || 50;
        const newHappiness = Math.min(100, Math.max(0, currentHappiness + selectedOption.points));
        localStorage.setItem(happinessKey, newHappiness.toString());
      }
  
      // Add assistant response if available
      if (selectedOption.response) {
        actions.addMessage({
          role: 'assistant',
          content: selectedOption.response
        });
  
        if (selectedOption.response.video) {
          setCurrentVideo(selectedOption.response.video);
        }
  
        const primaryText = selectedOption.response.chinese ||
                            selectedOption.response.japanese ||
                            selectedOption.response.korean ||
                            selectedOption.response.spanish;
        if (primaryText) {
          await playAudio(primaryText);
        }
      }
  
      // Progress to the next scene (local state change, no blockchain needed)
      if (currentScene >= 5) {
        // IMPORTANT: Mark chat as completed before showing end popup
        if (window.tokenManager?.initialized && selectedCharacter) {
          try {
            // First mark as completed in local storage
            const accessKey = `character_access_${address.toLowerCase()}_${selectedCharacter}`;
            const storedAccess = localStorage.getItem(accessKey);
            if (storedAccess) {
              try {
                const accessData = JSON.parse(storedAccess);
                accessData.completed = true;
                accessData.hasAccess = false; // Explicitly revoke access
                localStorage.setItem(accessKey, JSON.stringify(accessData));
              } catch (e) {
                console.error('Error updating access data:', e);
              }
            }
            
            // Then call token manager to revoke access in blockchain
            window.tokenManager.markChatCompleted(selectedCharacter);
            
            // Update local state
            setHasAccess(false);
          } catch (completionError) {
            console.error('Error marking chat as completed:', completionError);
          }
        }
        
        // Then show end popup
        setShowEndPopup(true);
        
        // Clean up local storage
        localStorage.removeItem(`scene_${selectedCharacter}_${address.toLowerCase()}`);
      } else {
        // Continue to next scene - DON'T end the chat
        setIsTransitioning(true);
      
        localStorage.setItem(`scene_${selectedCharacter}_${address.toLowerCase()}`,
          (currentScene + 1).toString()
        );
      
        setTimeout(() => {
          actions.setScene(currentScene + 1);
          setIsTransitioning(false);
        }, 1000);
      }
  
      setInput('');
      setShowOptions(false);
  
    } catch (error: any) {
      console.error('Chat error:', error);
      showErrorMessage(error.message || 'Failed to send message');
      setIsTransitioning(false);
      setInput('');
    }
  };
  
  const handleEndChat = () => {
    setShowEndPopup(false);
    
    if (selectedCharacter && address) {
      // ONLY update local state - no blockchain calls
      setHasAccess(false);
      
      // Update local storage directly
      const accessKey = `character_access_${address.toLowerCase()}_${selectedCharacter}`;
      try {
        // Mark as completed in local storage only
        const storedData = localStorage.getItem(accessKey);
        if (storedData) {
          const accessData = JSON.parse(storedData);
          accessData.completed = true;
          accessData.hasAccess = false;
          localStorage.setItem(accessKey, JSON.stringify(accessData));
        }
      } catch (e) {
        // If error, just remove the item
        localStorage.removeItem(accessKey);
      }
      
      // Manually dispatch events to update UI
      window.dispatchEvent(new CustomEvent('chatCompleted', {
        detail: { characterId: selectedCharacter }
      }));
      
      // Navigate away
      router.push(`/chat/${character?.language}`);
    } else {
      router.push('/');
    }
  };
  

  const handleReturnToSelection = () => {
    router.push(`/chat/${character?.language || ''}`);
  };

  // Render loading state
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Verifying access...</div>
      </div>
    );
  }

  // Render access control if user doesn't have access
if (!hasAccess && selectedCharacter) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Access Required</h1>
          <p className="text-gray-300 mb-6">
            You need to pay 10 LBAI tokens to chat with {character?.name || 'this character'}.
          </p>
            
            <CharacterAccessControl
              characterId={selectedCharacter}
              onAccessGranted={handleAccessGranted}
              className="w-full"
            />
            
            <Button
              variant="outline"
              onClick={handleReturnToSelection}
              className="mt-6 text-white border-gray-600 hover:bg-gray-700"
            >
              Return to Selection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card style={{ backgroundColor: '#101827', color: 'white' }} className="flex flex-col h-screen">
      <ChatHeader
  characterName={character?.name || ''}
  happiness={happiness[selectedCharacter || ''] || 50}
  characterId={selectedCharacter || ''}
  onBack={() => {
    // Simple navigation, no blockchain calls
    router.push(`/chat/${character?.language}`);
  }}
/>

      {showError && error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div style={{ backgroundColor: '#101827' }} className="flex-1 flex flex-col items-center justify-center relative p-4 space-y-4">
        {currentVideo && (
          <div className="max-w-xs max-h-64 w-full aspect-video bg-black z-10">
            <VideoPlayer src={currentVideo} className="w-full h-full object-cover" />
          </div>
        )}

        <div style={{ backgroundColor: '#101827' }} className="flex-1 overflow-y-auto w-full mt-4 pb-8">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <ChatMessageComponent
                key={i}
                message={{
                  role: message.role as 'user' | 'assistant',
                  content: message.content,
                  timestamp: message.timestamp
                }}
                avatarSrc={character?.image}
                onPlayAudio={handlePlayAudio}
                audioPlaying={audioPlaying}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937' }} className="p-4">
        <div className="relative">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowOptions(!showOptions)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
            >
              Show Options
            </Button>

            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or select a message..."
                className="w-full bg-gray-700 text-white"
                readOnly
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTransitioning}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              Send
            </Button>
          </div>

          {showOptions && currentSceneOptions.length > 0 && (
            <div className="absolute bottom-full left-0 w-full bg-gray-800 rounded-t-lg shadow-lg p-4">
              <ChatOptions
                options={currentSceneOptions}
                onSelectOption={handleOptionSelect}
                onPlayAudio={handlePlayAudio}
                audioPlaying={audioPlaying}
              />
            </div>
          )}
        </div>
      </div>

      {showEndPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl text-center transform scale-100 transition-transform duration-300 ease-in-out">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Conversation Ended</h2>
      <p className="mb-6 text-gray-600">Thank you for participating!</p>
      <Button
        onClick={() => {
          setShowEndPopup(false);
          router.push(`/chat/${character?.language}`);
        }}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-full shadow-lg transition-colors duration-300"
      >
        Back to Tutors
      </Button>
    </div>
  </div>
)}
    </Card>
  );
}
// src/components/ChatInterface/index.tsx