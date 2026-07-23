import type { TeamSnapshot } from './types';

// Clearly-labeled sample staff for the owner Team preview. Not real people
// or real numbers — the UI marks it as sample so it's never mistaken for
// live data.
export const sampleTeam: TeamSnapshot = {
  isSample: true,
  members: [
    {
      id: 'sample-1',
      name: 'Maria R. (sample)',
      roleLabel: 'Manager',
      clockState: 'ON',
      sinceLabel: '9:04 AM',
      hoursToday: 6.2,
      hoursThisWeek: 31.5,
      performance: {
        buys: 14,
        sales: 38,
        trades: 6,
        costPaid: 2140,
        profit: 1180,
      },
    },
    {
      id: 'sample-2',
      name: 'Devon P. (sample)',
      roleLabel: 'Employee',
      clockState: 'ON_BREAK',
      sinceLabel: '1:15 PM',
      hoursToday: 4.1,
      hoursThisWeek: 22.0,
      performance: {
        buys: 9,
        sales: 27,
        trades: 11,
        costPaid: 1585,
        profit: 730,
      },
    },
    {
      id: 'sample-3',
      name: 'Sam K. (sample)',
      roleLabel: 'Employee',
      clockState: 'OFF',
      sinceLabel: null,
      hoursToday: 0,
      hoursThisWeek: 18.75,
      performance: {
        buys: 4,
        sales: 15,
        trades: 3,
        costPaid: 610,
        profit: 300,
      },
    },
  ],
};
