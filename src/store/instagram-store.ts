/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Tipos das respostas das APIs da Meta/Instagram */
export type ShortLivedTokenResponse = {
  access_token: string;
  user_id: string;
  expires_in?: number;
  [k: string]: any;
};

export type LongLivedTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  [k: string]: any;
};

export type UserInfoResponse = {
  id: string;
  username: string;
  media_count?: number;
  account_type?: string;
  [k: string]: any;
};

export type MediaItem = {
  id: string;
  caption?: string;
  media_url?: string;
  media_type?: string;
  timestamp?: string;
  [k: string]: any;
};

export type ApiSource =
  | "fetchAccessToken"
  | "fetchLongLivedAccessToken"
  | "fetchUserInfo"
  | "fetchInstagramPosts"
  | "postImageToInstagram";

export type ApiResponseRecord = {
  id: string;                 // uid do registro
  officeId?: string | null;
  source: ApiSource;
  timestamp: number;
  payload: any;               // resposta crua
};

/** Estado por office */
export type OfficeInstagramState = {
  officeId: string;
  shortLived?: ShortLivedTokenResponse | null;
  longLived?: LongLivedTokenResponse | null;
  userInfo?: UserInfoResponse | null;
  posts?: MediaItem[] | null;
  shortLivedExpiresAt?: number | null; // epoch ms
  longLivedExpiresAt?: number | null;  // epoch ms
};

type InstagramState = {
  /** office "selecionado" dentro do próprio store */
  currentOfficeId: string;
  setCurrentOfficeId: (officeId: string) => void;

  /** Mapa officeId -> estado */
  byOffice: Record<string, OfficeInstagramState>;

  /** Histórico global de responses */
  history: ApiResponseRecord[];

  /** Upserts por office (usam currentOfficeId se não passar officeId) */
  upsertShortLived: (data: ShortLivedTokenResponse, officeId?: string) => void;
  upsertLongLived: (data: LongLivedTokenResponse, officeId?: string) => void;
  upsertUserInfo: (data: UserInfoResponse, officeId?: string) => void;
  upsertPosts: (data: MediaItem[], officeId?: string) => void;

  /** Historiza qualquer response bruto */
  addHistory: (rec: Omit<ApiResponseRecord, "id" | "timestamp">) => void;

  /** Getters utilitários */
  getOfficeState: (officeId?: string) => OfficeInstagramState | undefined;

  /** Limpezas */
  clearOffice: (officeId?: string) => void;
  clearAll: () => void;
};

function computeExpiresAt(expires_in?: number): number | null {
  if (!expires_in || expires_in <= 0) return null;
  return Date.now() + expires_in * 1000;
}

function ensureOfficeId(state: InstagramState, officeId?: string): string {
  const id = officeId ?? state.currentOfficeId ?? "default";
  return id || "default";
}

export const useInstagramStore = create<InstagramState>()(
  persist(
    (set, get) => ({
      currentOfficeId: "default",
      setCurrentOfficeId: (officeId) => set({ currentOfficeId: officeId || "default" }),

      byOffice: {},
      history: [],

      upsertShortLived: (data, officeId) => {
        set((state) => {
          const id = ensureOfficeId(state, officeId);
          const prev = state.byOffice[id] ?? { officeId: id };
          const next: OfficeInstagramState = {
            ...prev,
            shortLived: data,
            shortLivedExpiresAt: computeExpiresAt(data.expires_in),
          };
          return { byOffice: { ...state.byOffice, [id]: next } };
        });
        get().addHistory({ officeId: officeId ?? get().currentOfficeId, source: "fetchAccessToken", payload: data });
      },

      upsertLongLived: (data, officeId) => {
        set((state) => {
          const id = ensureOfficeId(state, officeId);
          const prev = state.byOffice[id] ?? { officeId: id };
          const next: OfficeInstagramState = {
            ...prev,
            longLived: data,
            longLivedExpiresAt: computeExpiresAt(data.expires_in),
          };
          return { byOffice: { ...state.byOffice, [id]: next } };
        });
        get().addHistory({ officeId: officeId ?? get().currentOfficeId, source: "fetchLongLivedAccessToken", payload: data });
      },

      upsertUserInfo: (data, officeId) => {
        set((state) => {
          const id = ensureOfficeId(state, officeId);
          const prev = state.byOffice[id] ?? { officeId: id };
          const next: OfficeInstagramState = { ...prev, userInfo: data };
          return { byOffice: { ...state.byOffice, [id]: next } };
        });
        get().addHistory({ officeId: officeId ?? get().currentOfficeId, source: "fetchUserInfo", payload: data });
      },

      upsertPosts: (data, officeId) => {
        set((state) => {
          const id = ensureOfficeId(state, officeId);
          const prev = state.byOffice[id] ?? { officeId: id };
          const next: OfficeInstagramState = { ...prev, posts: data };
          return { byOffice: { ...state.byOffice, [id]: next } };
        });
        get().addHistory({ officeId: officeId ?? get().currentOfficeId, source: "fetchInstagramPosts", payload: data });
      },

      addHistory: ({ officeId, source, payload }) => {
        const rec: ApiResponseRecord = {
          id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          officeId: officeId ?? get().currentOfficeId ?? "default",
          source,
          timestamp: Date.now(),
          payload,
        };
        set((state) => ({ history: [rec, ...state.history].slice(0, 5000) }));
      },

      getOfficeState: (officeId) => {
        const id = officeId ?? get().currentOfficeId ?? "default";
        return get().byOffice[id];
      },

      clearOffice: (officeId) => {
        const id = officeId ?? get().currentOfficeId ?? "default";
        set((state) => {
          const { [id]: _omit, ...rest } = state.byOffice;
          return { byOffice: rest };
        });
      },

      clearAll: () => set({ byOffice: {}, history: [] }),
    }),
    {
      name: "instagram-meta-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currentOfficeId: s.currentOfficeId,
        byOffice: s.byOffice,
        history: s.history,
      }),
    }
  )
);
