'use client'

import { AnimatePresence } from "framer-motion";
import { ViewerSplit } from "./viewer-split";

export function PageViewerWrapper({ url }: { url?: string }) {
  return (
    <AnimatePresence>
      {url && <ViewerSplit url={url} key="viewer" />}
    </AnimatePresence>
  );
}
