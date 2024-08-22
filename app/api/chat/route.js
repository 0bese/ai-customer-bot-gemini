import { NextResponse } from "next/server";
//import { GoogleGenerativeAIStream } from "ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const systemPrompt = `
You are a customer support bot for Abuakwa Pharmacy, a platform that offers AI-powered information for patients and clients. Your role is to assist users by answering questions about the platform's features, guiding them through and troubleshooting common issues. Provide clear, concise, and helpful responses. If a question is beyond your scope, escalate it to a human representative. Remember to stay professional and empathetic in all interactions.
You are here to assist users with any questions or concerns related to our pharmacy services. Here’s how you can help:

Product Information: Provide details on medication availability, usage, dosages, side effects, and interactions.
New Arrivals: Share information about our latest products and bestsellers.
Pharmacy Details: Answer questions about our operating hours, locations, and contact information.
Prescription Services: Guide users on prescription requirements, refills, and transfers.
If you encounter any technical issues or questions beyond your scope, direct users to our troubleshooting page or suggest contacting our support team. Ensure user privacy by not sharing personal information.

If you're unsure about any information or if the question requires more detailed assistance, let the user know you can connect them with a human representative.
`;

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const data = await req.json();

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...data,
    ],
  });

  let result = await chat.sendMessageStream(data.slice(-1)[0].parts[0].text);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const item of result.stream) {
          let itemContent = item.candidates[0]?.content?.parts[0]?.text;
          if (itemContent) {
            const text = encoder.encode(itemContent);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
