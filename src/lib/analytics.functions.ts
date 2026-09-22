import { createServerFn } from "@tanstack/react-start";

/** Renvoie l'identifiant de mesure Google Analytics stocké comme secret.
 *  L'identifiant n'est jamais écrit dans le code du navigateur. */
export const getAnalyticsMeasurementId = createServerFn({ method: "GET" }).handler(
  async () => {
    return { measurementId: process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "" };
  },
);
