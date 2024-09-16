import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DocumentType } from '@/types/document';
import { createClient } from '@/utils/supabase/client';

const openai = new OpenAI({
  organization: "org-31Ar3v3bAXi7nTb9fxadrYW2",
  project: "proj_JYPxFzMdSOpAa6H4PiYalYqV",
  timeout: 25000, // Ensure response within the 25-second time limit
});

// Define the structure of a discount object
interface Discount {
  title: string;
  link: string;
  type: DocumentType;
  summary: string;
  updated_at: string;
}

// Function to break content into chunks
const chunkContent = (content: string, chunkSize: number = 3000): string[] => {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
};

// Clean up invalid JSON returned by OpenAI
function cleanInvalidJSON(jsonString: string): string {
  return jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
}

// Function to process a single content chunk via OpenAI
async function processChunk(chunk: string): Promise<Discount[]> {
  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI that extracts student discounts and offers from blog content. 
                    Focus solely on unique offers from individual companies that provide clear and valuable discounts. 
                    Only return discounts that have a link to the offer. 
                    Return a **list** of discounts in **valid JSON array format** without additional formatting.
                    Each discount should include the following fields: 
                    - title (string including company name), 
                    - link to the discount (string), 
                    - type (choose from "entertainment", "fashion", "tech", "food", "health", "other"), 
                    - summary (string, describing the discount like "% off" or "special offer"), 
                    - updated_at (current timestamp).`
        },
        {
          role: "user",
          content: `Extract all relevant offers, deals, and discounts, including student discounts, from the following page content:\n\n${chunk}`
        }
      ]
    });

    let aiMessageContent = aiResponse.choices[0]?.message?.content?.trim() ?? '';
    aiMessageContent = cleanInvalidJSON(aiMessageContent);

    const chunkDiscounts: Discount[] = JSON.parse(aiMessageContent);
    const validDiscounts = chunkDiscounts.filter(discount => discount.link && discount.link.trim() !== '');
    return validDiscounts;
  } catch (error) {
    console.error('Error processing chunk:', error);
    return [];
  }
}

// Upload discounts to Supabase and return the data
async function uploadDiscountsToSupabase(supabase: any, discounts: Discount[]) {
  try {
    if (discounts.length > 0) {
      const { data, error } = await supabase.from('data').insert(
        discounts.map(discount => ({
          title: discount.title,
          link: discount.link,
          type: discount.type,
          summary: discount.summary,
          updated_at: new Date().toISOString(),
        }))
      );

      if (error) {
        console.error("Error uploading discounts to Supabase:", error);
      }
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error uploading discounts:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the content of the URL
    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML content using Cheerio
    const $ = cheerio.load(html);
    const pageContent = $.root().find('body').text();

    // Break content into chunks
    const contentChunks = chunkContent(pageContent);

    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of contentChunks) {
          // Process each chunk individually
          const discounts = await processChunk(chunk);

          // Upload to Supabase
          await uploadDiscountsToSupabase(supabase, discounts);

          // Stream the processed discounts back to the client
          controller.enqueue(JSON.stringify({ discounts }));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = "edge";