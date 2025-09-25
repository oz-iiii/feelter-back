"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteStore, useWatchHistoryStore } from "@/lib/stores";

export default function UserInitializer() {
  const { user } = useAuth();
  const { setCurrentUser: setFavoriteUser } = useFavoriteStore();
  const { setCurrentUser: setWatchHistoryUser } = useWatchHistoryStore();

  useEffect(() => {
    if (user?.id) {
      setFavoriteUser(user.id);
      setWatchHistoryUser(user.id);
    } else {
      setFavoriteUser(null);
      setWatchHistoryUser(null);
    }
  }, [user?.id, setFavoriteUser, setWatchHistoryUser]);

  return null; // UI를 렌더링하지 않음
}