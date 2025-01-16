import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from 'lucide-react'

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  unreadCount: number;
}

interface Message {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

export function MessagesTab() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", unreadCount: 2 },
    { id: 2, name: "Jane Smith", lastMessage: "Can we schedule a call?", unreadCount: 0 },
    { id: 3, name: "Bob Johnson", lastMessage: "Thanks for your help!", unreadCount: 1 },
  ]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setChatMessages([
      { id: 1, sender: 'user', message: "Hi there!", timestamp: new Date(Date.now() - 100000).toISOString() },
      { id: 2, sender: 'other', message: "Hello! How can I help you today?", timestamp: new Date(Date.now() - 80000).toISOString() },
      { id: 3, sender: 'user', message: "I have a question about your products.", timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 4, sender: 'other', message: "Sure, I'd be happy to help. What would you like to know?", timestamp: new Date(Date.now() - 40000).toISOString() },
    ]);
  };

  const sendMessage = () => {
    if (newMessage.trim() === "" || !selectedChat) return;
    const newMsg: Message = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };
    setChatMessages([...chatMessages, newMsg]);
    setNewMessage("");
    setChats(chats.map(chat =>
      chat.id === selectedChat.id ? { ...chat, lastMessage: newMessage } : chat
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px] flex">
        <div className="w-1/3 border-r pr-4 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''}`}
              onClick={() => selectChat(chat)}
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{chat.name}</h3>
                {chat.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full justify-end">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
            </div>
          ))}
        </div>
        <div className="w-2/3 pl-4 flex flex-col">
          {selectedChat ? (
            <>
              <div className="flex-1 overflow-y-auto mb-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      {msg.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 mr-2"
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

