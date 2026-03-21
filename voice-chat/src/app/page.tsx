import { VoiceChat } from '@/components/VoiceChat';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <VoiceChat
        language="zh"
        mission={{
          description: 'Find out where Shibuya Station is located.',
          hint: 'Try asking: "渋谷駅はどこですか？"',
          // This is what the AI holds — not shown to the user
          missionContext:
            'The learner is trying to find out the address / location of Shibuya Station in Tokyo. You know it is in Shibuya, Shibuya City, Tokyo (渋谷区渋谷). Reveal this naturally through conversation when they ask.',
        }}
      />
    </main>
  );
}
