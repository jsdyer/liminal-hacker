// Server-owned timing. Edits apply to the next issued passage; existing deadlines stay put.
export const journeyConfig = {
  firstWaitMinutes: 15,
  waitMinutes: 90,
  jitterMinutes: 30,
  // Random selection is without replacement: every new passage leads somewhere new.
};
