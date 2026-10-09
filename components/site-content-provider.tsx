"use client";

import { createContext, useContext } from "react";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";

const ContentContext = createContext<SiteContent>(defaultSiteContent);
export const SiteContentProvider = ContentContext.Provider;
export function useSiteContent() { return useContext(ContentContext); }
