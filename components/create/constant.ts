export const POLL_CATEGORIES: {
  value: string;
  label: string;
}[] = [
  {
    value: 'protocol_upgrades',
    label: 'Protocol Upgrades',
  },
  {
    value: 'economic_policy',
    label: 'Economic Policy',
  },
  {
    value: 'social_governance',
    label: 'Social Governance',
  },
  {
    value: 'security_and_risk_management',
    label: 'Security and Risk Management',
  },
  {
    value: 'ecosystem_and_funding',
    label: 'Ecosystem and Funding',
  },
  {
    value: 'ethical_and_legal_issues',
    label: 'Ethical and Legal Issues',
  },
  {
    value: 'infrastructure_and_clients',
    label: 'Infrastructure and Clients',
  },
  {
    value: 'cultural_and_philosophical_debates',
    label: 'Cultural and Philosophical Debates',
  },
];

export const POLL_CATEGORIES_MAP = POLL_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category.label;
    return acc;
  },
  {} as { [key: string]: string }
);
