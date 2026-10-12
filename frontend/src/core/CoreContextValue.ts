import { createContext } from "react";
import type { CoreService } from "./CoreService";

export type CoreContextValue = CoreService;

export const CoreContext = createContext<CoreContextValue | null>(null);
