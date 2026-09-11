/**
 * CampusTrack Rule-Based Matching Algorithm
 * Transparent, deterministic score calculation (0 - 100 points)
 */
const { query } = require('../config/db');

function calculateDescriptionSimilarity(desc1, desc2) {
  if (!desc1 || !desc2) return 0;
  
  const tokenize = (text) => {
    return new Set(
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'near'].includes(w))
    );
  };

  const words1 = tokenize(desc1);
  const words2 = tokenize(desc2);

  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  for (const w of words1) {
    if (words2.has(w)) common++;
  }

  // Jaccard-like overlap
  const union = new Set([...words1, ...words2]).size;
  const ratio = common / union;

  if (ratio >= 0.35 || common >= 2) return 10;
  if (ratio >= 0.15 || common >= 1) return 5;
  return 0;
}

function calculateScore(lostItem, foundItem) {
  let score = 0;
  const breakdown = {};

  // 1. Category match: 25 points
  if (lostItem.category_id === foundItem.category_id) {
    score += 25;
    breakdown.category = 25;
  } else {
    breakdown.category = 0;
  }

  // 2. Location match: 25 points
  if (lostItem.location_id === foundItem.location_id) {
    score += 25;
    breakdown.location = 25;
  } else {
    breakdown.location = 0;
  }

  // 3. Colour match: 15 points
  const lostColor = (lostItem.primary_color || '').trim().toLowerCase();
  const foundColor = (foundItem.primary_color || '').trim().toLowerCase();
  if (lostColor && foundColor && (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor))) {
    score += 15;
    breakdown.color = 15;
  } else {
    breakdown.color = 0;
  }

  // 4. Brand match: 15 points
  const lostBrand = (lostItem.brand || '').trim().toLowerCase();
  const foundBrand = (foundItem.brand || '').trim().toLowerCase();
  if (lostBrand && foundBrand && (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
    score += 15;
    breakdown.brand = 15;
  } else {
    breakdown.brand = 0;
  }

  // 5. Description similarity: 10 points
  const descSim = calculateDescriptionSimilarity(
    `${lostItem.item_name} ${lostItem.description || ''} ${lostItem.identifying_details || ''}`,
    `${foundItem.item_name} ${foundItem.description || ''} ${foundItem.identifying_details || ''}`
  );
  score += descSim;
  breakdown.description = descSim;

  // 6. Date proximity: 10 points
  const dLost = new Date(lostItem.date_lost);
  const dFound = new Date(foundItem.date_found);
  const diffDays = Math.abs((dFound - dLost) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    score += 10;
    breakdown.date = 10;
  } else if (diffDays <= 7) {
    score += 6;
    breakdown.date = 6;
  } else if (diffDays <= 14) {
    score += 2;
    breakdown.date = 2;
  } else {
    breakdown.date = 0;
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  let tier = 'Low Match';
  if (score >= 90) tier = 'Very High Match';
  else if (score >= 75) tier = 'High Match';
  else if (score >= 50) tier = 'Possible Match';

  return { score, tier, breakdown };
}

/**
 * Automatically evaluates candidate found items for a newly created or updated lost item
 */
async function findMatchesForLostItem(lostId) {
  const [lost] = await query('SELECT * FROM lost_items WHERE lost_id = ?', [lostId]);
  if (!lost) return [];

  // Check active found items
  const foundCandidates = await query(
    'SELECT * FROM found_items WHERE status IN ("Found", "Matched") AND category_id = ?',
    [lost.category_id]
  );

  const createdMatches = [];

  for (const found of foundCandidates) {
    const { score } = calculateScore(lost, found);
    if (score >= 45) {
      await query(
        `INSERT INTO matches (lost_id, found_id, score, match_status)
         VALUES (?, ?, ?, 'Suggested')
         ON DUPLICATE KEY UPDATE score = VALUES(score)`,
        [lost.lost_id, found.found_id, score]
      );

      // Update statuses to Matched if currently Lost/Found
      if (lost.status === 'Lost') {
        await query('UPDATE lost_items SET status = "Matched" WHERE lost_id = ?', [lost.lost_id]);
      }
      if (found.status === 'Found') {
        await query('UPDATE found_items SET status = "Matched" WHERE found_id = ?', [found.found_id]);
      }

      createdMatches.push({ found_id: found.found_id, score });
    }
  }

  return createdMatches;
}

/**
 * Automatically evaluates candidate lost items for a newly created found item
 */
async function findMatchesForFoundItem(foundId) {
  const [found] = await query('SELECT * FROM found_items WHERE found_id = ?', [foundId]);
  if (!found) return [];

  const lostCandidates = await query(
    'SELECT * FROM lost_items WHERE status IN ("Lost", "Matched") AND category_id = ?',
    [found.category_id]
  );

  const createdMatches = [];

  for (const lost of lostCandidates) {
    const { score } = calculateScore(lost, found);
    if (score >= 45) {
      await query(
        `INSERT INTO matches (lost_id, found_id, score, match_status)
         VALUES (?, ?, ?, 'Suggested')
         ON DUPLICATE KEY UPDATE score = VALUES(score)`,
        [lost.lost_id, found.found_id, score]
      );

      if (lost.status === 'Lost') {
        await query('UPDATE lost_items SET status = "Matched" WHERE lost_id = ?', [lost.lost_id]);
      }
      if (found.status === 'Found') {
        await query('UPDATE found_items SET status = "Matched" WHERE found_id = ?', [found.found_id]);
      }

      createdMatches.push({ lost_id: lost.lost_id, score });
    }
  }

  return createdMatches;
}

module.exports = {
  calculateScore,
  findMatchesForLostItem,
  findMatchesForFoundItem
};
