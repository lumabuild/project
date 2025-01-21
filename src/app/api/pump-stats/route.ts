import { NextResponse } from 'next/server';

const PUMP_FUN_WS_URL = 'wss://pumpportal.fun/api/data';

export const runtime = 'edge';

export async function GET() {
  const encoder = new TextEncoder();
  let ws: WebSocket | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      ws = new WebSocket(PUMP_FUN_WS_URL);
      
      ws.onopen = () => {
        ws?.send(JSON.stringify({
          method: "subscribeNewToken"
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = event.data;
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error('Error handling message:', error);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };

      ws.onclose = () => {
        controller.close();
        ws = null;
      };
    },
    cancel() {
      ws?.close();
      ws = null;
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 