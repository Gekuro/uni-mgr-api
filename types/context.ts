export type ServerContext = {
  UUID?: string;
};

declare module "mercurius" {
  interface MercuriusContext extends ServerContext {}
}
