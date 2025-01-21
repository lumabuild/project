import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://api-neo.bullx.io/v2/api/resolveTokensV2', {
      method: 'POST',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhYmQzYTQzMTc4YzE0MjlkNWE0NDBiYWUzNzM1NDRjMDlmNGUzODciLCJ0eXAiOiJKV1QifQ.eyJsb2dpblZhbGlkVGlsbCI6IjIwMjUtMDQtMDZUMTM6MDY6MjIuMDc5WiIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ic2ctdjIiLCJhdWQiOiJic2ctdjIiLCJhdXRoX3RpbWUiOjE3MzYxNjg3ODMsInVzZXJfaWQiOiIweDc1OTA5NWNhY2IxZjVmM2RjZjRlOTVjNGZlZGMwZWIwYTgyNzY0MmIiLCJzdWIiOiIweDc1OTA5NWNhY2IxZjVmM2RjZjRlOTVjNGZlZGMwZWIwYTgyNzY0MmIiLCJpYXQiOjE3MzcxMzI0NTcsImV4cCI6MTczNzEzNjA1NywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.iL3IXEQaSwfZYVM_8SmHdymwRWHGU5Q7_6Mu_qhKHYMsYrLuLx-7QQdPDpGKfaLY5ExNZcJDvzAojd5gXVX0VINmDnKDz3wNncCIHyOfA5m7OYbaIt0VdY-rU0iAhwXarLiKiyYXj0WgFyaxviWVQXi0NMqVwYnqo49mtaJFwIJTcqGswRv_tukIKca1o-gqztSdSgLSVACoxyb-WPi5CiaTOL7h59EHVUY0DJ57fy7qht9bQbAu9QkzPh7O1XaclnKsvuodnlpc9MKty3PnVD7FPzMkLKY3lPLhtK0x9asDVx3t_jxXqmx07mOsbucVO0PcoFMP4U5Hu9ygVuOWTw',
        'content-type': 'application/json',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'x-cs-token': 'E-rvzePbwKcapU44mZCue.5b63487f23df6fbcad99332e34e8e4c2669326eb4232789634481021ae96f918',
        'Referer': 'https://neo.bullx.io/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: String(error) }, 
      { status: 500 }
    );
  }
} 