export const getRedisConnectionString = () => {
  const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } =
    process.env;

  return `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
};
