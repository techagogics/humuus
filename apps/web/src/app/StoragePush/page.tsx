'use client';

import { Button } from '@/components/ui/OldButton';
import Link from 'next/link';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';

export default function GuessTheFake(props: any) {
  const nakamaRef = useRef<Nakama | undefined>(undefined);

  const [imgData] = useState<Object>({
    real: ['1270', '2092', '6401', '8157'],
    fake: ['4215', '4307', '5034', '5952'],
  });

  const [quizData] = useState<Array<any>>([
    {
      question: {
        text: 'Was ist ein Deepfake?',
        options: [
          'Gefälschte Medieninhalte',
          'Eine neue Trendsportart',
          'Ein leckerer Nachtisch',
          'Ein fieser Algorithmus',
        ],
      },
      answer: [1],
    },
    {
      question: {
        text: 'Was können Deepfakes sein?',
        options: ['Videos', 'Fotos', 'Zeitungsartikel', 'Leckere Nachtische'],
      },
      answer: [1, 2],
    },
    {
      question: {
        text: 'Wie kannst du einen Deepfake erkennen?',
        options: [
          'An Bilddetails wie Stirnrunzeln',
          'Am Lächeln',
          'An den Schuhen',
          'Am Schatten',
        ],
      },
      answer: [1, 4],
    },
    {
      question: {
        text: 'Wie kannst du die Echtheit von Fotos/Videos überprüfen?',
        options: [
          'Ich esse einen leckeren Nachtisch und achte auf mein Bauchgefühl',
          'Ich vertraue den Kommentaren unter dem Video',
          'Ich checke die Quelle des Videos',
          'Ich rufe den Telefonjoker an',
        ],
      },
      answer: [3],
    },
    {
      question: {
        text: 'Welche Tipps gibt es noch?',
        options: [
          'Auffälliges Make Up ist immer Fake',
          'Ich nasche einen leckeren Nachtisch',
          'Ich berate mich mit Anderen',
          'Ich vergleiche das Foto mit anderen Fotos der Person',
        ],
      },
      answer: [3, 4],
    },
    {
      question: {
        text: 'Handbewegungen können helfen Deepfakes zu erkennen. Warum?',
        options: [
          'Handbewegungen sind leicht zu faken',
          'Deepfakes zeigen nie Hände',
          'Durch Bewegungen, wie streichen durchs Haar entstehen Fehler',
          'Hände im Gesicht verdecken die Fehler im Deepfake',
        ],
      },
      answer: [3],
    },
    {
      question: {
        text: 'Wofür können Deepfakes NICHT eingesetzt werden?',
        options: [
          'Fake News',
          'Tote zum Leben erwecken',
          'Cybermobbing',
          'Hausaufgaben machen',
        ],
      },
      answer: [4],
    },
    {
      question: {
        text: 'Wer steckt hinter dem TikTok-Kanal "deeptomcruise"?',
        options: [
          'kein Mensch - ein rein digitaler Avatar',
          'kein Deepfake - ein realer Doppelgänger von Tom Cruise',
          'Deepfakes von einem Doppelgänger',
          'Tom Cruise selbst steckt dahinter',
        ],
      },
      answer: [3],
    },
    {
      question: {
        text: 'Was ist der Unterschied zwischen einem "Deepfake" und einem normalen gefälschten Video?',
        options: [
          'Es gibt keinen Unterschied',
          'Deepfakes nutzen künstliche Intelligenz um ein Gesicht einzufügen',
          'Der leckere Nachtisch',
          'Deepfakes sind immer professionell produziert',
        ],
      },
      answer: [2],
    },
    {
      question: {
        text: 'Welche Technologie steckt hinter Deepfakes?',
        options: [
          'Die HoloLens',
          'Neuronale Netzwerke',
          'Virtual Reality',
          'Unreal Engine',
        ],
      },
      answer: [2],
    },
    {
      question: {
        text: 'Was solltest du tun, wenn du ein Deepfake entdeckst, in dem eine Person ungewollt dargestellt wird?',
        options: [
          'Ihn sofort auf allen sozialen Medien teilen',
          'Die Entdeckung der Quelle melden und das Deepfake nicht weiter verbreiten',
          'Einen bösen Kommentar hinterlassen',
          'Auf das Video reagieren, indem man selbst ein Deepfake erstellt',
        ],
      },
      answer: [2],
    },
    {
      question: {
        text: 'Deepfakes kann man immer anhand der Videoqualität erkennen!',
        options: ['Richtig', 'Falsch'],
      },
      answer: [2],
    },
    {
      question: {
        text: 'Welche Aussage über Deepfakes ist korrekt?',
        options: [
          'Sie sind teuer herzustellen',
          'Sie sind schwer zu erkennen',
          'Sie benötigen Bilder einer Person als Trainingsdaten',
          'Sie können nur auf ganz bestimmte Personen angewendet werden',
        ],
      },
      answer: [2, 3],
    },
    {
      question: {
        text: 'Was ist das Ziel von Deepfake-Erkennungstechnologie?',
        options: [
          'Sie soll Deepfakes erstellen',
          'Sie soll Deepfakes identifizieren und entfernen',
          'Sie soll Deepfakes verbessern',
          'Sie soll Deepfakes automatisch versenden',
        ],
      },
      answer: [2, 3],
    },
  ]);

  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticateDevice();
    };
    initNakama();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushObject(key: string, data: any) {
    nakamaRef.current?.writeDataToStorage(key, data);
  }

  return (
    <div className="flex flex-col justify-center max-w-screen-md m-auto text-center">
      <Button
        onClick={() => pushObject('deepfake_detective', quizData)}
        size="lg"
        variant="primary"
        className="m-auto my-5"
        asChild
      >
        <Link href="">Push Deepfake_Detective</Link>
      </Button>
      <Button
        onClick={() => pushObject('guess_the_fake', imgData)}
        size="lg"
        variant="primary"
        className="m-auto my-5"
        asChild
      >
        <Link href="">Push Guess The Fake</Link>
      </Button>
    </div>
  );
}
