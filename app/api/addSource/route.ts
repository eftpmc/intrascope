import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DocumentType } from '@/types/document';
import { createClient } from '@/utils/supabase/client';

const openai = new OpenAI({
  organization: "org-31Ar3v3bAXi7nTb9fxadrYW2",
  project: "proj_JYPxFzMdSOpAa6H4PiYalYqV",
  timeout: 120000,
});

// Define the structure of a discount object
interface Discount {
  title: string;
  link: string;
  type: DocumentType;
  summary: string; // Short summary of the discount, like "% off"
  updated_at: string; // Timestamp of when the discount was last updated
}

// Function to break content into smaller chunks
const chunkContent = (content: string, chunkSize: number = 2000): string[] => {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to check for duplicates and organize existing discounts
async function removeDuplicatesAndOrganize(supabase: any, newDiscounts: Discount[]) {
  try {
    // Fetch existing discounts from the database
    const { data: existingDiscounts, error } = await supabase.from('data').select('*');

    if (error) {
      console.error('Error fetching existing discounts:', error);
      return { error };
    }

    // Filter out duplicates based on `link`
    const uniqueDiscounts = newDiscounts.filter(newDiscount => {
      return !existingDiscounts.some((existing: Discount) => existing.link === newDiscount.link);
    });

    // Return the list of unique discounts (excluding duplicates)
    return { uniqueDiscounts };
  } catch (error) {
    console.error('Error during duplication check:', error);
    return { error };
  }
}

function cleanInvalidJSON(jsonString: string): string {
  return jsonString
    .replace(/,\s*}/g, '}') // Remove trailing commas inside objects
    .replace(/,\s*]/g, ']'); // Remove trailing commas inside arrays
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

    // Parse the HTML content
    const $ = cheerio.load(html);

    // Extract all text content from the page
    const pageContent = $.root().find('body').text();

    // Break the content into chunks to avoid truncation
    const contentChunks = chunkContent(pageContent);

    // Type `allDiscounts` as an array of `Discount` objects
    let allDiscounts: Discount[] = [];

    // Process each chunk through OpenAI
    for (const chunk of contentChunks) {
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
                      - updated_at (current timestamp). 
                      Do not include any discounts that are missing a link.`
          },
          {
            role: "user",
            content: `Extract all relevant offers, deals, and discounts, including student discounts, from the following page content:\n\n${chunk}`
          } 
        ],
      });

      // Handle the AI response
      if (aiResponse.choices && aiResponse.choices.length > 0) {
        let aiMessageContent = aiResponse.choices[0]?.message?.content?.trim() ?? '';

        // Strip out code block delimiters (```json ... ```) and ensure clean JSON format
        aiMessageContent = aiMessageContent.replace(/```json/g, '').replace(/```/g, '').trim();

        aiMessageContent = cleanInvalidJSON(aiMessageContent);

        try {
          // Attempt to parse the content as JSON
          const chunkDiscounts: Discount[] = JSON.parse(aiMessageContent);

          // Filter out any discounts that do not have a valid link
          const validDiscounts = chunkDiscounts.filter(discount => discount.link && discount.link.trim() !== '');

          // Append valid discounts to the final array
          allDiscounts = [...allDiscounts, ...validDiscounts];
        } catch (parseError) {
          console.error('Error parsing AI response as JSON:', parseError);
          console.log('Raw AI response:', aiMessageContent);  // Log the raw response for debugging
        }
      } else {
        console.error('No valid response from AI');
      }
    }

    // Run the duplicate check and clean up existing data
    const { uniqueDiscounts, error: duplicateCheckError } = await removeDuplicatesAndOrganize(supabase, allDiscounts);

    if (duplicateCheckError ) {
      return NextResponse.json({ error: "Failed to clean up duplicates" }, { status: 500 });
    }

    if (uniqueDiscounts){
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

      return NextResponse.json({ success: true, data }, { status: 200 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  runtime: 'edge', // Enable edge function runtime
};