import { z } from "zod";
import { FILE_PROXIES } from "./constants";
import { readByLine } from "./file";

const ipOrDomainPattern =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.?)+(?:[A-Za-z]{2,6})$/;

const ipOrDomainSchema = z
  .string()
  .refine((value) => ipOrDomainPattern.test(value), {
    message: "Invalid IP or domain format",
  });

const proxySchema = z.object({
  type: z.union([z.literal("http"), z.literal("socks")]),
  host: ipOrDomainSchema,
  port: z
    .string()
    .regex(/\d+/, "Must be a number")
    .transform((str) => Number(str)),
  username: z.string(),
  password: z.string(),
  changeUrl: z.string().url().optional(),
});

export const getProxies = () => {
  const proxies = readByLine(FILE_PROXIES);

  return proxies.map((proxy) => {
    const [type, host, port, user, pass, changeUrl] = proxy.split(";");
    return proxySchema.parse({ type, host, port, user, pass, changeUrl });
  });
};
