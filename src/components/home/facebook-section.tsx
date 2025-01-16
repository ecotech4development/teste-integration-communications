/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Send, RefreshCw, LogOut } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  authenticateFacebook,
  fetchUserData,
  fetchPageData,
  fetchPosts,
  publishPost,
  deletePost,
  fetchChats,
  fetchMessages,
  sendMessage,
  Post,
  Chat,
  Message
} from "@/api/facebookApi";

export default function FacebookSection() {
  const [accessToken, setAccessToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [postMessage, setPostMessage] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      initializeData(token);
    }
  }, []);

  useEffect(() => {
    if (pageData) {
      loadPosts();
      loadChats();
    }
  }, [pageData]);

  const initializeData = async (token: string) => {
    const user = await fetchUserData(token);
    setUserData(user);
    const page = await fetchPageData(token);
    setPageData(page);
  };

  const loadPosts = async () => {
    setIsLoading(true);
    //@ts-expect-error
    const fetchedPosts = await fetchPosts(pageData.id, pageData.access_token);
    setPosts(fetchedPosts);
    setIsLoading(false);
  };

  const handlePublishPost = async () => {
    //@ts-expect-error
    if (await publishPost(pageData.id, pageData.access_token, postMessage)) {
      setPostMessage("");
      loadPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    //@ts-expect-error
    if (await deletePost(postId, pageData.access_token)) {
      loadPosts();
    }
  };

  const loadChats = async () => {
    //@ts-expect-error
    const fetchedChats = await fetchChats(pageData.id, pageData.access_token);
    setChats(fetchedChats);
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setIsLoadingMessages(true);
    //@ts-expect-error
    const fetchedMessages = await fetchMessages(chat.id, pageData.access_token);
    setMessages(fetchedMessages);
    setIsLoadingMessages(false);
  };

  const handleSendMessage = async () => {
    //@ts-expect-error
    if (await sendMessage(pageData.id, pageData.access_token, selectedChat.senderId, newMessage)) {
      setNewMessage("");
      //@ts-expect-error
      handleSelectChat(selectedChat);
    }
  };

  return (
    <div className="space-y-4">
      {!accessToken ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Button onClick={authenticateFacebook} className="flex items-center space-x-2">
              <Facebook className="w-5 h-5" />
              <span>Connect to Facebook</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Facebook Integration</h1>
            <Button onClick={() => setAccessToken('')} variant="outline" className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileTab userData={userData} pageData={pageData} />
            </TabsContent>
            <TabsContent value="posts">
              <PostsTab
                postMessage={postMessage}
                setPostMessage={setPostMessage}
                handlePublishPost={handlePublishPost}
                posts={posts}
                isLoading={isLoading}
                handleDeletePost={handleDeletePost}
                loadPosts={loadPosts}
              />
            </TabsContent>
            <TabsContent value="messages">
              <MessagesTab
                chats={chats}
                selectedChat={selectedChat}
                handleSelectChat={handleSelectChat}
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                pageData={pageData}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function ProfileTab({ userData, pageData }: any) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ID: {userData?.id}</p>
          <p>First Name: {userData?.first_name}</p>
          <p>Last Name: {userData?.last_name}</p>
          <p>Email: {userData?.email}</p>
        </CardContent>
      </Card>
      {pageData && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Page Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Name: {pageData.name}</p>
            <p>Page ID: {pageData.id}</p>
            <Input value={pageData.access_token} readOnly />
            <Button className="mt-2" onClick={() => navigator.clipboard.writeText(pageData.access_token)}>
              <Copy className="w-5 h-5 mr-2" />
              Copy Token
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function PostsTab({ postMessage, setPostMessage, handlePublishPost, posts, isLoading, handleDeletePost, loadPosts }: any) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Publish Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What's on your mind?"
            value={postMessage}
            onChange={(e) => setPostMessage(e.target.value)}
            rows={4}
            className="mb-4"
          />
          <Button onClick={handlePublishPost} className="w-full flex items-center justify-center">
            <Send className="w-5 h-5 mr-2" />
            Publish Post
          </Button>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Posts</span>
            <Button onClick={loadPosts} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post: { id: React.Key | null | undefined; created_time: string | number | Date; message: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                <div key={post.id} className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.created_time).toLocaleString()}
                  </p>
                  <p>{post.message}</p>
                  <Separator className="my-2" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete Post
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your post from Facebook.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <p>No posts found.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function MessagesTab({ chats, selectedChat, handleSelectChat, messages, isLoadingMessages, newMessage, setNewMessage, handleSendMessage, pageData }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[600px]">
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            {chats.map((chat: { id: React.Key | null | undefined; senderName: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; updated_time: string | number | Date; }) => (
              <div
                key={chat.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleSelectChat(chat)}
              >
                <h3 className="font-semibold">{chat.senderName}</h3>
                <p className="text-sm text-gray-600 truncate">
                  Last updated: {new Date(chat.updated_time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="w-2/3 pl-4 flex flex-col">
            {selectedChat ? (
              <>
                <div className="flex-1 overflow-y-auto mb-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    messages.map((msg: { id: React.Key | null | undefined; from: { id: any; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; message: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                      <div key={msg.id} className={`mb-2 ${msg.from.id === pageData?.id ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded-lg ${msg.from.id === pageData?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                          {msg.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {msg.from.name}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 mr-2"
                  />
                  <Button onClick={handleSendMessage}>
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
        </div>
      </CardContent>
    </Card>
  );
}

