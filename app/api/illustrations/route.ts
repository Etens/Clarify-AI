import type { NextApiRequest } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface NextApiRequestWithUrl extends NextApiRequest {
  nextUrl: URL;
}

export async function GET(req: NextApiRequestWithUrl) {
  try {

    const keyword = req.nextUrl.searchParams.get('keyword') || 'nature';
    if (!keyword) {
      return new Response(JSON.stringify({ message: "Missing keyword parameter" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Récupération du mot-clé avec succès :', keyword);
    }

    const url = 'https://storyset.com/rafiki';
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
      console.log('Récupération du HTML avec succès');
    }

    const $ = cheerio.load(html);
    if (!$) {
      return new Response(JSON.stringify({ message: "No HTML content found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Chargement du HTML avec succès');
    }

    console.log('Recherche du mot-clé dans le HTML...');
    const parent = $(`a[title="${keyword}"]`).html();
    if (!parent) {
      return new Response(JSON.stringify({ message: "Keyword not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Mot-clé trouvé avec succès :', parent);
    }
    const script: string | null = $(parent).find('script').html();
    if (!script) {
      return new Response(JSON.stringify({ message: "No script found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Script trouvé avec succès :', script);
    }
    const scriptJson = JSON.parse(script);
    console.log('Script parsé avec succès :', scriptJson);
    const imageUrl = scriptJson.thumbnailUrl;
    if (!imageUrl) {
      return new Response(JSON.stringify({ message: "No image found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ imageUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    return new Response(JSON.stringify({ message: "Erreur interne du serveur" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
