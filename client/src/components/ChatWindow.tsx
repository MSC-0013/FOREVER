  import React, { useState, useEffect, useRef, useCallback } from 'react';
  import { useParams } from 'react-router-dom';
  import { format } from 'date-fns';
  import { useChat } from '../contexts/ChatContext';
  import { useSocket } from '../contexts/SocketContext';
  import { useAuth } from '../contexts/AuthContext';
  import { Send, Smile, Paperclip, Phone, Video, X, Image as ImageIcon, Mic, Film } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import data from '@emoji-mart/data';
  import Picker from '@emoji-mart/react';
  import SimplePeer from 'simple-peer';

  type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected';

  const ChatWindow: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { messages, fetchMessages, sendMessage, contacts, setActiveContact } = useChat();
    const { user } = useAuth();
    const { onlineUsers, typingUsers, startTyping, stopTyping } = useSocket();

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMediaMenu, setShowMediaMenu] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<SimplePeer.Instance | null>(null);

    const [lastSentMessage, setLastSentMessage] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true);

    const currentContact = contacts.find(c => c._id === userId);
    const chatMessages = userId ? messages[userId] || [] : [];
    const isTyping = userId ? Boolean(typingUsers[userId]) : false;
    const isUserOnline = userId ? onlineUsers.includes(userId) : false;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      if (messagesEndRef.current && isAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    }, [isAtBottom]);

    const handleScroll = useCallback(() => {
      if (!chatContainerRef.current) return;
      const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
      const bottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(bottom);
    }, []);

    useEffect(() => {
      if (userId) {
        fetchMessages(userId);
        inputRef.current?.focus();
      }
    }, [userId, fetchMessages]);

    useEffect(() => {
      if (currentContact) {
        setActiveContact(currentContact);
      }
    }, [currentContact, setActiveContact]);

    useEffect(() => {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.addEventListener('scroll', handleScroll);
        return () => chatContainer.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);

    useEffect(() => {
      scrollToBottom();
    }, [chatMessages, scrollToBottom]);

    const startCall = async (isVideo: boolean) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream
        });

        peer.on('signal', (data: SimplePeer.SignalData) => {
              // Send signal data to the other peer through your signaling server
              console.log('Signal data:', data);
            });

        peer.on('stream', (stream: MediaStream) => {
              setRemoteStream(stream);
              if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
              }
            });

        peerRef.current = peer;
        setCallStatus('calling');
      } catch (err) {
        console.error('Failed to start call:', err);
      }
    };

    const endCall = () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      setLocalStream(null);
      setRemoteStream(null);
      setCallStatus('idle');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        // Handle file upload and sending
        console.log('File content:', content);
      };
      reader.readAsDataURL(file);
    };

    const handleEmojiSelect = (emoji: any) => {
      setNewMessage(prev => prev + emoji.native);
      setShowEmojiPicker(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const messageText = newMessage.trim();
      
      if (!messageText || isSending || !userId || messageText === lastSentMessage) return;

      try {
        setIsSending(true);
        setLastSentMessage(messageText);
        setNewMessage('');
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        stopTyping(userId);
        
        await sendMessage(messageText, userId);
        setIsAtBottom(true);
        scrollToBottom('smooth');
        inputRef.current?.focus();
      } catch (error) {
        console.error('Failed to send message:', error);
        setNewMessage(messageText);
      } finally {
        setIsSending(false);
        setTimeout(() => setLastSentMessage(''), 1000);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewMessage(value);

      if (!userId) return;

      if (value) {
        startTyping(userId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => stopTyping(userId), 3000);
      } else {
        stopTyping(userId);
      }
    };

    const groupedMessages = chatMessages.reduce((groups: Record<string, typeof chatMessages>, message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});

    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10"
        >
          <div className="flex items-center">
            {currentContact ? (
              <>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    {currentContact.username[0].toUpperCase()}
                  </div>
                  <AnimatePresence>
                    {isUserOnline && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute bottom-0 right-0 flex"
                      >
                        <span className="absolute h-3 w-3 bg-green-500 rounded-full ring-2 ring-white" />
                        <motion.span 
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-3 w-3 bg-green-500 rounded-full ring-2 ring-white opacity-75" 
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-slate-800">{currentContact.username}</p>
                  <AnimatePresence mode="wait">
                    {isTyping ? (
                      <motion.div 
                        key="typing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-blue-600 font-medium"
                      >
                        typing...
                      </motion.div>
                    ) : (
                      <motion.p 
                        key="status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-slate-500"
                      >
                        {isUserOnline ? 'Online' : 'Offline'}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="h-10 w-40 bg-slate-200 animate-pulse rounded-md" />
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => startCall(false)}
              className="p-2 rounded-full hover:bg-slate-100"
              disabled={callStatus !== 'idle'}
            >
              <Phone size={20} className="text-slate-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => startCall(true)}
              className="p-2 rounded-full hover:bg-slate-100"
              disabled={callStatus !== 'idle'}
            >
              <Video size={20} className="text-slate-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Call Interface */}
        <AnimatePresence>
          {callStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            >
              <div className="bg-white rounded-lg shadow-xl p-4 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {callStatus === 'calling' ? 'Calling...' : 'In Call'}
                  </h3>
                  <button
                    onClick={endCall}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {remoteStream && (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                  {localStream && (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg border-2 border-white"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Body */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
          onScroll={handleScroll}
        >
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <div className="px-3 py-1 bg-slate-200 rounded-full text-xs text-slate-600 font-medium">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              {dateMessages.map((msg, i) => {
                const isSender = msg.sender === user?.id;
                const showAvatar = !isSender && (i === 0 || dateMessages[i-1]?.sender !== msg.sender);
                
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-end ${isSender ? 'justify-end' : 'justify-start'} space-x-2`}
                  >
                    {!isSender && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {currentContact?.username[0].toUpperCase()}
                      </div>
                    )}
                    
                    {!isSender && !showAvatar && <div className="w-8 flex-shrink-0" />}
                    
                    <div className={`max-w-[75%] ${!isSender && !showAvatar ? 'ml-10' : ''}`}>
                      <div 
                        className={`px-4 py-2 rounded-2xl shadow-sm ${
                          isSender 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        {msg.type === 'image' ? (
                          <img src={msg.content} alt="Shared image" className="rounded-lg max-w-full" />
                        ) : msg.type === 'video' ? (
                          <video src={msg.content} controls className="rounded-lg max-w-full" />
                        ) : msg.type === 'audio' ? (
                          <audio src={msg.content} controls className="w-full" />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                      </div>
                      <div className={`flex mt-1 text-xs ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <span className={`${isSender ? 'text-slate-500' : 'text-slate-400'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                className="flex justify-start" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
              >
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {currentContact?.username[0].toUpperCase()}
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[120px] flex items-center space-x-1">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                      className="w-2 h-2 bg-slate-400 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.15 }}
                      className="w-2 h-2 bg-slate-400 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                      className="w-2 h-2 bg-slate-400 rounded-full" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form 
          onSubmit={handleSendMessage} 
          className="p-4 bg-white border-t border-slate-200"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMediaMenu(!showMediaMenu)}
                className="p-2 rounded-full hover:bg-slate-100"
              >
                <Paperclip size={20} className="text-slate-600" />
              </motion.button>
              <AnimatePresence>
                {showMediaMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-4 py-2 hover:bg-slate-100 w-full"
                    >
                      <ImageIcon size={18} className="mr-2" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-4 py-2 hover:bg-slate-100 w-full"
                    >
                      <Film size={18} className="mr-2" />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-4 py-2 hover:bg-slate-100 w-full"
                    >
                      <Mic size={18} className="mr-2" />
                      <span>Audio</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*"
            />

            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-full bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-colors disabled:opacity-70"
            />

            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full hover:bg-slate-100"
              >
                <Smile size={20} className="text-slate-600" />
              </motion.button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                      previewPosition="none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className={`p-2.5 rounded-full shadow-sm flex items-center justify-center transition-colors ${
                newMessage.trim() && !isSending
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={18} className={isSending ? 'animate-pulse' : ''} />
            </motion.button>
          </div>
        </form>
      </div>
    );
  };

  export default ChatWindow;