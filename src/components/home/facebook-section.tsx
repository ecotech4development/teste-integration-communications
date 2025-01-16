/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client'
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Send, RefreshCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CLIENT_ID = '532715486592411';
const REDIRECT_URI = 'https://teste-integration-communications.vercel.app/';

interface Post {
  created_time: string;
  message: string;
  id: string;
}

export default function FacebookSection() {
  const [accessToken, setAccessToken] = useState("");
  const [userData, setUserData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [postMessage, setPostMessage] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      fetchUserData(token);
      fetchPageData(token);
    }
  }, []);

  useEffect(() => {
    if (pageData) {
      fetchPosts();
    }
  }, [pageData]);

  const authenticateInstagram = () => {
    window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?response_type=token&display=popup&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&auth_type=rerequest&scope=pages_show_list%2Cpages_messaging%2Cwhatsapp_business_management%2Cpages_read_engagement%2Cpages_manage_metadata%2Cpages_manage_posts%2Cwhatsapp_business_messaging%2Cinstagram_manage_messages`;
  };

  const fetchUserData = async (accessTokenUser: string) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,first_name,last_name,email&access_token=${accessTokenUser}`);
    const data = await response.json();
    setUserData(data);
  };

  const fetchPageData = async (accessTokenUser: string) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessTokenUser}`);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      setPageData(data.data[0]);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true); // Set loading to true before fetching
    if (!pageData) return;

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${pageData.id}/feed?access_token=${pageData.access_token}`);
      const data = await response.json();
      if (data.data) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Set loading to false after fetching, regardless of success or failure
    }
  };

  const publishPost = async () => {
    if (!pageData || !postMessage) {
      toast({
        title: "Error",
        description: "Page data or message is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${pageData.id}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: postMessage,
          access_token: pageData.access_token,
        }),
      });

      const data = await response.json();

      if (data.id) {
        toast({
          title: "Success",
          description: "Post published successfully!",
        });
        setPostMessage("");
        fetchPosts(); // Refresh posts after publishing
      } else {
        toast({
          title: "Error",
          description: "Failed to publish post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      toast({
        title: "Error",
        description: "An error occurred while publishing the post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!pageData) return;

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${postId}?access_token=${pageData.access_token}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post deleted successfully!",
        });
        fetchPosts(); // Refresh posts after deleting
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Button onClick={authenticateInstagram} className="flex items-center space-x-2">
            <Facebook className="w-5 h-5" />
            <span>Connect to Facebook</span>
          </Button>
        </CardContent>
      </Card>

      {accessToken && (
        <Card>
          <CardHeader>
            <CardTitle>Access Token</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={accessToken} readOnly />
            <Button className="mt-2" onClick={() => navigator.clipboard.writeText(accessToken)}>
              <Copy className="w-5 h-5" />
              Copy Token
            </Button>
          </CardContent>
        </Card>
      )}

      {userData && (
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ID: {userData.id}</p>
            <p>First Name: {userData.first_name}</p>
            <p>Last Name: {userData.last_name}</p>
            <p>Email: {userData.email}</p>
          </CardContent>
        </Card>
      )}

      {pageData && (
        <Card>
          <CardHeader>
            <CardTitle>Page Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Name: {pageData.name}</p>
            <p>Page ID: {pageData.id}</p>
            <Input value={pageData.access_token} readOnly />
            <Button className="mt-2" onClick={() => navigator.clipboard.writeText(pageData.access_token)}>
              <Copy className="w-5 h-5" />
              Copy Token
            </Button>
          </CardContent>
        </Card>
      )}

      {pageData && (
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
            <Button onClick={publishPost} className="w-full flex items-center justify-center">
              <Send className="w-5 h-5 mr-2" />
              Publish Post
            </Button>
          </CardContent>
        </Card>
      )}

      {pageData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Posts</span>
              <Button onClick={fetchPosts} variant="outline" size="sm">
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
                {posts.map((post) => (
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
                          <AlertDialogAction onClick={() => deletePost(post.id)}>
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
      )}
    </div>
  );
}

