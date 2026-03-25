import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { RealtimePresenceState } from "@supabase/supabase-js";

export interface PresenceUser {
  userId: string;
  email: string;
}

/**
 * Tracks which users are currently viewing a given list
 * using Supabase Realtime Presence.
 */
export function usePresence(listId: string) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!listId || !user) return;

    const channel = supabase.channel(`presence-${listId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state: RealtimePresenceState = channel.presenceState();
        const users: PresenceUser[] = [];
        for (const presences of Object.values(state)) {
          for (const p of presences) {
            const presence = p as unknown as PresenceUser & { presence_ref: string };
            if (presence.userId !== user.id) {
              users.push({ userId: presence.userId, email: presence.email });
            }
          }
        }
        // Deduplicate by userId
        const seen = new Set<string>();
        setOnlineUsers(
          users.filter((u) => {
            if (seen.has(u.userId)) return false;
            seen.add(u.userId);
            return true;
          })
        );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: user.id,
            email: user.email ?? "",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, user]);

  return onlineUsers;
}
