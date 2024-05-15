import type { NextApiRequest } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface NextApiRequestWithUrl extends NextApiRequest {
  nextUrl: URL;
}

export async function GET(req: NextApiRequestWithUrl) {
  try {
    const style = req.nextUrl.searchParams.get('style') || 'rafiki';
    const keyword = req.nextUrl.searchParams.get('keyword') || 'nature';
    if (!keyword) {
      return new Response(JSON.stringify({ message: "Missing keyword parameter" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Récupération du mot-clé avec succès :', keyword);
    }

    const url = `https://storyset.com/search?q=${keyword}`;
    if (!url) {
      return new Response(JSON.stringify({ message: "Missing URL parameter" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Récupération de l\'URL avec succès :', url);
    }

    const { data: html } = await axios.get(url);
    if (!html) {
      return new Response(JSON.stringify({ message: "No HTML content found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Contenu HTML récupéré avec succès :', html.slice(0, 100));
    }

    const $ = cheerio.load(html);
    let imageUrl = null;
    $('script[type="application/ld+json"]').each((_i, elem) => {
      const scriptContent = $(elem).html() as string;
      // const keywordName = keyword.replace(/-/g, ' ');
      try {
        const jsonData = JSON.parse(scriptContent);
        if (jsonData['@type'] === 'ImageObject' &&
          // jsonData.name.toLowerCase().replace(/-/g, ' ') === keywordName.toLowerCase() &&
          jsonData.thumbnailUrl.includes(style)) {
          imageUrl = jsonData.thumbnailUrl.replace(/"/g, '');
        }
      } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
      }
    });

    if (imageUrl) {
      console.log('URL de l\'image récupérée avec succès :', imageUrl);
      return new Response(imageUrl, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      return new Response(JSON.stringify({ message: "No image URL found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  catch (error) {
    console.error("Erreur lors de la récupération des données");
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
