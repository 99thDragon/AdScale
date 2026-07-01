/**
 * Mock ad creative previews per campaign (until live platform API).
 * @typedef {{ id: string, format: string, headline: string, status: string }} Creative
 */

/** @type {Record<string, Creative[]>} */
const MOCK_CREATIVES = {
  '1': [
    { id: 'c1-a', format: 'Image · Feed', headline: 'Summer Sale — 30% Off Everything', status: 'Active' },
    { id: 'c1-b', format: 'Carousel · Stories', headline: 'Shop the Summer Collection', status: 'Active' },
  ],
  '2': [
    { id: 'c2-a', format: 'Search · RSA', headline: 'Brand Awareness — Discover Our Story', status: 'Active' },
  ],
  '3': [
    { id: 'c3-a', format: 'Video · Reels', headline: 'Product Launch — See It First', status: 'Active' },
    { id: 'c3-b', format: 'Image · Feed', headline: 'New Arrivals — Limited Drop', status: 'Paused' },
  ],
  '4': [
    { id: 'c4-a', format: 'Display · GDN', headline: 'Come Back — Your Cart Misses You', status: 'Paused' },
  ],
  '5': [
    { id: 'c5-a', format: 'Image · Feed', headline: 'Holiday Promo — Gift Guide Inside', status: 'Active' },
  ],
  '6': [
    { id: 'c6-a', format: 'Search · RSA', headline: 'Get a Demo — Free Trial Available', status: 'Active' },
  ],
}

/** @param {string} campaignId @returns {Creative[]} */
export function getCampaignCreatives(campaignId) {
  return MOCK_CREATIVES[campaignId] ?? [
    { id: 'default', format: 'Image', headline: 'Campaign creative', status: 'Active' },
  ]
}
