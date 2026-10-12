import { createContext } from "react";
import type { CoreService } from "./CoreService";

export const CoreContext = createContext<CoreService | null>(null);
