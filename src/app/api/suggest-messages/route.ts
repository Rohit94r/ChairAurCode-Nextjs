const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export async function POST() {
  return new Response(initialMessageString, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
