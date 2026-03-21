import { VoiceChat } from '@/components/VoiceChat';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <VoiceChat
        language="en"
        mission={{
          description: 'Find out which district of Tokyo Shibuya Station is in.',
          hint: 'Ask the bot directly where Shibuya Station is!',
          missionContext:
            'The learner wants to know which district Shibuya Station is located in. You know it is in Shibuya City (Shibuya-ku), Tokyo. Make them ask naturally — drop the answer once they ask.',
          answer: 'Shibuya City (Shibuya-ku), Tokyo',
          wrongChoices: ['Shinjuku City (Shinjuku-ku), Tokyo', 'Harajuku, Shibuya-ku, Tokyo', 'Akihabara, Chiyoda-ku, Tokyo'],
          xpReward: 150,
        }}
      />
    </main>
  );
}
