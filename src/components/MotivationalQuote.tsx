import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';

const quotes = [
  "Consistency is a skill. Train it.",
  "You don't fail by missing a day. You fail by pretending you didn't.",
  "Discipline is choosing between what you want now and what you want most.",
  "The person you're becoming is built one honest day at a time.",
  "Accountability isn't about perfection. It's about truth.",
  "Every expert was once a beginner who refused to give up.",
  "Success is the sum of small efforts repeated daily.",
  "Your future self is watching. Make them proud.",
  "The gap between goals and results is filled with daily discipline.",
  "Don't break the chain. But if you do, start a new one immediately.",
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem('daily-quote');
    const savedDate = localStorage.getItem('daily-quote-date');

    if (savedDate === today && savedQuote) {
      setQuote(savedQuote);
    } else {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      localStorage.setItem('daily-quote', randomQuote);
      localStorage.setItem('daily-quote-date', today);
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#0A2540] to-[#0d3051] rounded-lg p-6 text-white">
      <div className="flex items-start gap-4">
        <Quote className="w-8 h-8 text-[#00D4FF] flex-shrink-0 mt-1" />
        <p className="text-lg leading-relaxed">{quote}</p>
      </div>
    </div>
  );
}
