/* eslint-disable @typescript-eslint/no-explicit-any */
import Cookie from "js-cookie";
import { createClient } from "@supabase/supabase-js";
import {
  useInstagramStore,
  type MediaItem,
  type UserInfoResponse,
} from "@/store/instagram-store";

/** ⚠️ Em produção, mova CLIENT_SECRET para o servidor */
const CLIENT_ID = "546357825037011";
const CLIENT_SECRET = "e022de7d587386dfb9132b95879e4284";
const REDIRECT_URI = "https://teste-integration-communications.vercel.app/";

const supabase = createClient(
  "https://izklvvxbafdyzxuethaf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6a2x2dnhiYWZkeXp4dWV0aGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDk0NzUsImV4cCI6MjA1MjYyNTQ3NX0.I8QcjYFxZRv6GhCaQUhHnmnRp9Qw8HHLWCWQ5iGY3Sc"
);

export const authenticateInstagram = () => {
  window.location.href = `https://www.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
};

/** Short-lived token */
export const fetchAccessToken = async (code: string) => {
  const formData = new URLSearchParams();
  formData.append("client_id", CLIENT_ID);
  formData.append("client_secret", CLIENT_SECRET);
  formData.append("grant_type", "authorization_code");
  formData.append("redirect_uri", REDIRECT_URI);
  formData.append("code", code);

  const response = await fetch("/api/getToken", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as {
    access_token: string;
    user_id: string;
    expires_in?: number;
    [k: string]: any;
  };

  // cookies (se você quiser manter)
  Cookie.set("instagram_access_token", data.access_token, { expires: 60 });
  Cookie.set("instagram_user_id", data.user_id, { expires: 60 });

  // salva no store
  useInstagramStore.getState().upsertShortLived(data);

  return data;
};
 
/** Long-lived token */
export const fetchLongLivedAccessToken = async (shortLivedToken: string) => {
  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${shortLivedToken}`;
  const response = await fetch(url);
  const data = (await response.json()) as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
    [k: string]: any;
  };

  useInstagramStore.getState().upsertLongLived(data);

  return data;
};

export const fetchUserInfo = async (token: string) => {
  const url = `https://graph.instagram.com/me?fields=id,username,media_count,account_type&access_token=${token}`;
  const response = await fetch(url);
  const data = (await response.json()) as UserInfoResponse;

  useInstagramStore.getState().upsertUserInfo(data);

  return data;
};

export const fetchInstagramPosts = async (token: string) => {
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp&limit=10&access_token=${token}`;
  const response = await fetch(url);
  const result = await response.json();
  const posts = (result?.data ?? []) as MediaItem[];

  useInstagramStore.getState().upsertPosts(posts);

  return posts;
};

export const postImageToInstagram = async (
  file: File,
  caption: string,
  accessToken: string,
  userId: string
) => {
  const { data } = await supabase.storage.from("IntegrationTest").upload(file.name, file, {
    cacheControl: "3600",
    upsert: true,
  });

  // @ts-expect-error types do supabase
  const { data: getData } = await supabase.storage.from("IntegrationTest").getPublicUrl(data?.path);

  const formData = new FormData();
  formData.append("image_url", getData.publicUrl);
  formData.append("caption", caption);
  formData.append("access_token", accessToken);

  const mediaResponse = await fetch(`/api/createImage/${userId}`, {
    method: "POST",
    body: formData,
  });
  const mediaData = await mediaResponse.json();

  if (!mediaData.id) {
    throw new Error("Failed to create media object");
  }

  const publishResponse = await fetch(`/api/mediaPublish/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: mediaData.id,
      access_token: accessToken,
    }),
  });

  if (!publishResponse.ok) {
    throw new Error("Failed to publish image");
  }

  const result = await publishResponse.json();

  // historiza o publish no store
  useInstagramStore.getState().addHistory({
    source: "postImageToInstagram",
    payload: { mediaData, publishResult: result },
  });

  return result;
};
