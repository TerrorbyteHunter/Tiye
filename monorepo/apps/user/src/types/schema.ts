export type { Route, Ticket, Vendor } from '../../../../packages/utils/src/types/schema';

declare module '../../../../packages/utils/src/types/schema' {
  interface Ticket {
    vendorName?: string;
  }
} 