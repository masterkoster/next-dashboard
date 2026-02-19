import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

const pusherServer = appId && key && secret && cluster
  ? new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    })
  : null;

export async function triggerPusher(channel: string, event: string, payload: unknown) {
  if (!pusherServer) return;
  try {
    await pusherServer.trigger(channel, event, payload);
  } catch (error) {
    console.error('Failed to trigger Pusher event', error);
  }
}

export function isPusherConfigured() {
  return Boolean(pusherServer);
}
