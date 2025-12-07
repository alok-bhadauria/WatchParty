function requiredFields(body, fields = []) {
  const missing = [];
  for (const f of fields) {
    const v = body[f];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      missing.push(f);
    }
  }
  return missing;
}

module.exports = { requiredFields };
