/* eslint-disable @typescript-eslint/ban-ts-comment */
import { toast } from "@/hooks/use-toast";

const CLIENT_ID = '532715486592411';
// const REDIRECT_URI = 'https://magpie-kind-earwig.ngrok-free.app/';
const REDIRECT_URI = 'https://teste-integration-communications.vercel.app/';

export interface Post {
    created_time: string;
    message: string;
    id: string;
}

export interface Chat {
    id: string;
    link: string;
    updated_time: string;
    senderName: string;
    senderEmail: string;
    senderId: string;
}

export interface Message {
    id: string;
    message: string;
    from: {
        name: string;
        email: string;
        id: string;
    };
}

export const authenticateFacebook = () => {
    window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?response_type=token&display=popup&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&auth_type=rerequest&scope=pages_show_list%2Cpages_messaging%2Cwhatsapp_business_management%2Cpages_read_engagement%2Cpages_manage_metadata%2Cpages_manage_posts%2Cwhatsapp_business_messaging%2Cinstagram_manage_messages`;
};

export const fetchUserData = async (accessToken: string) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,first_name,last_name,email&access_token=${accessToken}`);
    return await response.json();
};

export const fetchPageData = async (accessToken: string) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
    const data = await response.json();
    return data.data && data.data.length > 0 ? data.data[0] : null;
};

export const fetchPosts = async (pageId: string, accessToken: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed?access_token=${accessToken}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
            title: "Error",
            description: "Failed to fetch posts",
            variant: "destructive",
        });
        return [];
    }
};

export const publishPost = async (pageId: string, accessToken: string, message: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                access_token: accessToken,
            }),
        });

        const data = await response.json();

        if (data.id) {
            toast({
                title: "Success",
                description: "Post published successfully!",
            });
            return true;
        } else {
            throw new Error('Failed to publish post');
        }
    } catch (error) {
        console.error("Error publishing post:", error);
        toast({
            title: "Error",
            description: "An error occurred while publishing the post",
            variant: "destructive",
        });
        return false;
    }
};

export const deletePost = async (postId: string, accessToken: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${postId}?access_token=${accessToken}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            toast({
                title: "Success",
                description: "Post deleted successfully!",
            });
            return true;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        //@ts-ignore
        toast({ title: "Error", description: error.message || "An error occurred while deleting the post", variant: "destructive", });
        return false;
    }
};

export const fetchChats = async (pageId: string, accessToken: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/conversations?access_token=${accessToken}`);
        const data = await response.json();

        if (data.data) {
            const chatsWithSenderInfo = await Promise.all(
                //@ts-expect-error
                data.data.map(async (chat) => {
                    const messageResponse = await fetch(
                        `https://graph.facebook.com/v21.0/${chat.id}/messages?fields=from&access_token=${accessToken}`
                    );
                    const messageData = await messageResponse.json();

                    let senderInfo = null;

                    for (const message of messageData.data) {
                        if (message.from.id !== pageId) {
                            senderInfo = { name: message.from.name, email: message.from.email, id: message.from.id };
                            break;
                        }
                    }

                    if (senderInfo) {
                        return {
                            ...chat,
                            senderName: senderInfo.name,
                            senderEmail: senderInfo.email,
                            senderId: senderInfo.id,
                        };
                    }
                    return null;
                })
            );

            return chatsWithSenderInfo.filter(chat => chat !== null);
        }
        return [];
    } catch (error) {
        console.error("Error fetching chats:", error);
        toast({
            title: "Error",
            description: "Failed to fetch chats",
            variant: "destructive",
        });
        return [];
    }
};

export const fetchMessages = async (chatId: string, accessToken: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${chatId}/messages?fields=message,from&access_token=${accessToken}`);
        const data = await response.json();
        return data.data ? [...data.data].reverse() : [];
    } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
            title: "Error",
            description: "Failed to fetch messages",
            variant: "destructive",
        });
        return [];
    }
};

export const sendMessage = async (pageId: string, accessToken: string, recipientId: string, message: string) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                messaging_type: 'RESPONSE',
                message: { text: message },
                access_token: accessToken,
            }),
        });

        const data = await response.json();

        if (data.message_id) {
            toast({
                title: "Success",
                description: "Message sent successfully!",
            });
            return true;
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error("Error sending message:", error);
        toast({
            title: "Error",
            description: "An error occurred while sending the message",
            variant: "destructive",
        });
        return false;
    }
};

