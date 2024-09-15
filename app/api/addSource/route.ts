import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // Extract title and description
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    const description = $('meta[name="description"]').attr('content') || 
                        $('p').first().text() || 
                        'No description available';

    // Extract all text content from the page
    const pageContent = $('body').text();

    // Use AI to analyze the content and extract discounts
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that extracts student discounts and offers from blog content. For each discount or offer, provide the following information: 1) Company or brand name, 2) Discount percentage or amount, 3) Product or service category, 4) Any conditions or requirements, 5) Expiration date if available. Format the information as a JSON array."
        },
        {
          role: "user",
          content: `Extract student discounts and offers from the following blog content:\n\n${pageContent}`
        }
      ],
    });

    const discounts = JSON.parse(aiResponse.choices[0].message.content || '[]');

    // Determine the type based on the content
    const type = discounts.length > 0 ? 'student_discount' : 'other';

    console.log(discounts)

    // Return a simple 200 status code
    return NextResponse.json({}, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}