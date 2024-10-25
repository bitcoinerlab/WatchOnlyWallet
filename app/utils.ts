export const electrumParams = (
  electrumAPI: string,
): { protocol: "ssl" | "tcp"; host: string; port: number } => {
  const regex = /^(.*):\/\/([^:/]+)(?::(\d+))?/;
  const matches = electrumAPI.match(regex);

  // Throw if matches are not exactly 3 (protocol, host, and optionally port)
  if (!matches || matches.length < 3) {
    throw new Error(`Invalid electrumAPI ${electrumAPI}`);
  }

  const protocol = matches[1];
  const host = matches[2];
  const port = matches[3];

  if (!host) {
    throw new Error(`Invalid host: ${host}.`);
  }

  // Validate protocol (must be 'ssl' or 'tcp')
  if (protocol !== "ssl" && protocol !== "tcp") {
    throw new Error(`Invalid protocol: ${protocol}. Expected 'ssl' or 'tcp'.`);
  }

  // Validate port (must be a number)
  if (!port || isNaN(Number(port))) {
    throw new Error(`Invalid or missing port: ${port}. Port must be a number.`);
  }

  return {
    protocol: protocol as "ssl" | "tcp", // Type assertion for strict typing
    host,
    port: Number(port), // Convert port to a number
  };
};
