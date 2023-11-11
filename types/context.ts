export type ServerContext = {
  UUID?: string;
};

declare module "npm:mercurius" {
  interface MercuriusContext extends ServerContext {}
}
