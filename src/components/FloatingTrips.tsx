import { useEffect, useState } from 'react';

interface FloatingTrip {
  id: number;
  text: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
}

const tripNames = [
  'Harry Potter in UK',
  'Emily in Paris',
  'Frida in Mexico',
  'Romeo & Juliet in Verona',
  'Lord of the Rings in New Zealand',
  'Game of Thrones in Iceland',
  'Bridgerton in London',
  'Money Heist in Madrid',
  'Vikings in Norway',
  'La Casa de Papel in Spain',
  'Narcos in Colombia',
  'The Crown in England',
  'Dark in Germany',
  'Stranger Things in Indiana',
  'Breaking Bad in Albuquerque',
];

export default function FloatingTrips() {
  const [trips, setTrips] = useState<FloatingTrip[]>([]);

  useEffect(() => {
    const generatedTrips = tripNames.map((text, index) => ({
      id: index,
      text,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * -20,
      size: 0.8 + Math.random() * 0.4,
    }));
    setTrips(generatedTrips);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="absolute whitespace-nowrap text-gray-200 font-medium animate-float"
          style={{
            left: `${trip.x}%`,
            top: `${trip.y}%`,
            fontSize: `${trip.size}rem`,
            animationDuration: `${trip.duration}s`,
            animationDelay: `${trip.delay}s`,
          }}
        >
          {trip.text}
        </div>
      ))}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.15;
          }
          25% {
            transform: translate(20px, -30px) rotate(2deg);
            opacity: 0.25;
          }
          50% {
            transform: translate(-15px, -60px) rotate(-2deg);
            opacity: 0.15;
          }
          75% {
            transform: translate(25px, -90px) rotate(1deg);
            opacity: 0.2;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
