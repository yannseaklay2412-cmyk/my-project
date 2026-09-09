export const MOCK_PROJECT = {
  id: 1,
  title: 'StudyBuddy — AI flashcards for exams',
  status: 'Open for collaborators',
  description:
    'StudyBuddy turns your lecture slides and PDFs into spaced-repetition flashcards automatically, so you spend time studying instead of making cards. It tracks what you forget and resurfaces it right before you would.',
  problem:
    'Students waste hours making flashcards by hand and have no idea which topics they are actually weak on before an exam. StudyBuddy automates both.',
  techStack: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API', 'Tailwind'],
  updatedAt: 'Updated 2 days ago',
  owner: { name: 'Sophea Chan', university: 'AUPP', year: 'Year 3', major: 'CS' },
  members: [
    { name: 'Sophea Chan', role: 'Owner' },
    { name: 'Dara Kim', role: 'Backend' },
    { name: 'Rith Meng', role: 'Frontend' },
  ],
  openSpots: 2,
  github: { repo: 'sophea/studybuddy', stars: 128, issues: 14, updated: '2d' },
};

export function isProjectMember(user) {
  return MOCK_PROJECT.members.some((member) => member.name === user?.full_name);
}

export const MOCK_COMMENTS = [
  { author: 'Dara Kim', time: '2h', text: 'Love this idea — are you thinking of supporting Khmer text in the PDFs too? Happy to help with the parsing.' },
  { author: 'Nita Sok', time: '5h', text: 'This would have saved me last semester 😄 following!' },
  { author: 'Visal Ny', time: '1d', text: 'Suggestion: let users edit the auto-generated cards before studying, the AI won\'t be perfect.' },
];
