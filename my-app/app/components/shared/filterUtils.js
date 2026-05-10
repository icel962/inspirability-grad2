export const normalizeText = (value) => String(value || "").trim();

export const normalizeOptionValue = (value) =>
  normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const splitList = (value) =>
  Array.isArray(value)
    ? value.map(normalizeText).filter(Boolean)
    : String(value || "")
        .split(/[,;|]/)
        .map(normalizeText)
        .filter(Boolean);

export const getNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getMaxNumberFromText = (value) => {
  const matches = String(value || "").match(/\d+(?:\.\d+)?/g);
  if (!matches) return null;

  return Math.max(...matches.map(Number));
};

export const getAgeGroups = (values, patterns) => {
  const text = values.map(normalizeText).join(" ").toLowerCase();
  const groups = new Set();

  if (patterns.kids?.test(text)) groups.add("Kids");
  if (patterns.teens?.test(text)) groups.add("Teens");
  if (patterns.adults?.test(text)) groups.add("Adults");

  return [...groups];
};

export const getDiagnosisValues = (primaryValue, ...values) => {
  const text = [primaryValue, ...values].map(normalizeText).join(" ").toLowerCase();
  const diagnoses = new Set();

  if (text.includes("autism") || text.includes("asd")) diagnoses.add("Autism");
  if (text.includes("adhd") || text.includes("attention")) diagnoses.add("ADHD");
  if (text.includes("down")) diagnoses.add("Down Syndrome");
  if (text.includes("cerebral") || text.includes("cp")) diagnoses.add("Cerebral Palsy");
  if (text.includes("dyslexia") || text.includes("learning")) diagnoses.add("Dyslexia");
  if (text.includes("physical") || text.includes("mobility") || text.includes("impairment")) {
    diagnoses.add("Physical Disability");
  }

  splitList(primaryValue).forEach((item) => {
    if (item && item.toLowerCase() !== "n/a") diagnoses.add(item);
  });

  return [...diagnoses];
};

export const getOptions = (items, key) => {
  const seen = new Map();

  items.forEach((item) => {
    const values = Array.isArray(item[key]) ? item[key] : [item[key]];

    values.filter(Boolean).forEach((value) => {
      const optionValue = normalizeOptionValue(value);
      if (optionValue && !seen.has(optionValue)) {
        seen.set(optionValue, { value: optionValue, label: value });
      }
    });
  });

  return [...seen.values()];
};
