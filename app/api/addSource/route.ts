import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DocumentType } from '@/types/document';
import { createClient } from '@/utils/supabase/client';

const openai = new OpenAI({
  organization: "org-31Ar3v3bAXi7nTb9fxadrYW2",
  project: "proj_JYPxFzMdSOpAa6H4PiYalYqV",
  timeout: 60000, // Ensure response within the 25-second time limit
});

// Define the structure of a discount object
interface Discount {
  title: string;
  link: string;
  type: DocumentType;
  summary: string;
  updated_at: string;
}

// Function to break content into smaller chunks
const chunkContent = (content: string, chunkSize: number = 2000): string[] => {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to clean up invalid JSON returned by OpenAI
function cleanInvalidJSON(jsonString: string): string {
  return jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
}

// Function to check for duplicates and organize existing discounts
async function removeDuplicatesAndOrganize(supabase: any, newDiscounts: Discount[]) {
  try {
    const { data: existingDiscounts, error } = await supabase.from('data').select('*');

    if (error) {
      console.error('Error fetching existing discounts:', error);
      return { error };
    }

    // Filter out duplicates based on `link`
    const uniqueDiscounts = newDiscounts.filter(newDiscount => {
      return !existingDiscounts.some((existing: Discount) => existing.link === newDiscount.link);
    });

    return { uniqueDiscounts };
  } catch (error) {
    console.error('Error during duplication check:', error);
    return { error };
  }
}

// Function to process content chunks concurrently via OpenAI
async function processChunks(contentChunks: string[]): Promise<Discount[]> {
  const allDiscounts: Discount[] = [];

  // Process chunks concurrently with Promise.all
  const aiResponses = await Promise.all(contentChunks.map(chunk => {
    return openai.chat.completions.create({
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
  }));

  // Handle responses
  for (const aiResponse of aiResponses) {
    if (aiResponse?.choices?.length > 0) {
      let aiMessageContent = aiResponse.choices[0]?.message?.content?.trim() ?? '';
      aiMessageContent = cleanInvalidJSON(aiMessageContent);

      try {
        const chunkDiscounts: Discount[] = JSON.parse(aiMessageContent);
        const validDiscounts = chunkDiscounts.filter(discount => discount.link && discount.link.trim() !== '');
        allDiscounts.push(...validDiscounts);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }
    }
  }

  return allDiscounts;
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

    // Break content into chunks to avoid truncation
    const contentChunks = chunkContent(pageContent);

    // Process all chunks concurrently and fetch discounts
    const allDiscounts = await processChunks(contentChunks);

    // Run duplicate check on the new discounts
    const { uniqueDiscounts, error: duplicateCheckError } = await removeDuplicatesAndOrganize(supabase, allDiscounts);

    if (duplicateCheckError) {
      return NextResponse.json({ error: "Failed to clean up duplicates" }, { status: 500 });
    }

    // If there are unique discounts, upload them to the Supabase database
    if (uniqueDiscounts && uniqueDiscounts.length > 0) {
      const { data, error } = await supabase
        .from('data')
        .insert(
          uniqueDiscounts.map(discount => ({
            title: discount.title,
            link: discount.link,
            type: discount.type,
            summary: discount.summary,
            updated_at: new Date().toISOString(),
          }))
        );

      if (error) {
        console.error("Error uploading discounts to Supabase:", error);
        return NextResponse.json({ error: "Failed to upload discounts" }, { status: 500 });
      }

      // Return the uploaded data as response
      return NextResponse.json({ success: true, data }, { status: 200 });
    } else {
      return NextResponse.json({ success: true, message: "No new discounts found" }, { status: 200 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = "edge";