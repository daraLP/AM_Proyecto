import type { ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  QUERY_CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE,
  queryClient,
  queryPersister,
} from "@/lib/queryClient";
import { FeedbackProvider } from "./FeedbackProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: QUERY_CACHE_MAX_AGE,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
      onSuccess={() => {
        // Reenvía los movimientos que quedaron en cola sin conexión (RNF-02)
        void queryClient.resumePausedMutations();
      }}
    >
      <FeedbackProvider>{children}</FeedbackProvider>
    </PersistQueryClientProvider>
  );
}
