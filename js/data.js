// ---------------------------------------------------------------------
// The double A journey - month data
//
// How to add a month's memories:
//   1. Drop your photos into  photos/month-XX/  (e.g. photos/month-01/1.jpg)
//   2. List those filenames in the `photos` array below for that month.
//   3. Write a `description` for the month (line breaks are kept).
//
// The anniversary date is the 28th of each month (started Oct 28, 2025).
// ---------------------------------------------------------------------

const ANNIVERSARY_DAY_LABEL = 'Aug 28, 2026'; // 10-month milestone
const ANNIVERSARY_DATE = new Date('2026-08-28T00:00:00');

const MONTHS = [
  {
    number: 1,
    title: 'Where It All Began',
    range: 'Oct 28 – Nov 28, 2025',
    description: 'Write about this month here! What happened, how you felt, the little things worth remembering. 🥹',
    photos: [],
  },
  {
    number: 2,
    title: 'Getting Closer',
    range: 'Nov 28 – Dec 28, 2025',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 3,
    title: 'Falling Deeper',
    range: 'Dec 28, 2025 – Jan 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 4,
    title: 'New Year, Us',
    range: 'Jan 28 – Feb 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 5,
    title: 'Half a Year? Almost!',
    range: 'Feb 28 – Mar 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 6,
    title: 'Six Months of Us',
    range: 'Mar 28 – Apr 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 7,
    title: 'Lucky Number Seven',
    range: 'Apr 28 – May 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 8,
    title: 'Still Going Strong',
    range: 'May 28 – Jun 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 9,
    title: 'Nine and Counting',
    range: 'Jun 28 – Jul 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
  },
  {
    number: 10,
    title: 'Double Digits, Baby',
    range: 'Jul 28 – Aug 28, 2026',
    description: 'Fill me in! ✨',
    photos: [],
    current: true,
  },
];
