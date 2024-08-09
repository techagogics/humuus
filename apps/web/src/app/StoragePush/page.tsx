'use client';

import { Button } from '@/components/ui/OldButton';
import Link from 'next/link';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';

export default function GuessTheFake(props: any) {
  const nakamaRef = useRef<Nakama | undefined>(undefined);

  enum NodeType {
    Lobby = 0,
    Scoreboard = 1,
    Countdown = 2,
    Headline = 3,
    DefaultQuiz = 4,
    ImgQuiz = 5,
  }

  const [deepfakeDetectiveImgQuizData] = useState<Array<Object>>([
    {
      type: NodeType.Headline,
      settings: {
        secondsUntilAnswer: 0,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Deepfake Detective! Erkenne den Deepfake?',
      },
      answer: null,
    },
    {
      type: NodeType.Countdown,
      settings: {
        secondsUntilAnswer: 0,
        secondsAutoNext: 5,
      },
      data: {},
      answer: null,
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['05719', '25486'],
      },
      answer: [1],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['27307', '10629'],
      },
      answer: [2],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['29568', '12056'],
      },
      answer: [2],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['14215', '30371'],
      },
      answer: [1],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['20149', '31270'],
      },
      answer: [1],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['32759', '35255'],
      },
      answer: [2],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['45952', '33704'],
      },
      answer: [1],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['16663', '62128'],
      },
      answer: [2],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['83250', '19792'],
      },
      answer: [1],
    },
    {
      type: NodeType.ImgQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Welcher ist der Deepfake?',
        images: ['95034', '20829'],
      },
      answer: [1],
    },
    {
      type: NodeType.Scoreboard,
      settings: {
        secondsUntilAnswer: 0,
        secondsAutoNext: 0,
      },
      data: {},
      answer: null,
    },
  ]);

  const [deepfakeDetectiveQuizData] = useState<Array<Object>>([
    {
      type: NodeType.Headline,
      settings: {
        secondsUntilAnswer: 0,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Deepfake Detective Quiz!',
      },
      answer: null,
    },
    {
      type: NodeType.Countdown,
      settings: {
        secondsUntilAnswer: 0,
        secondsAutoNext: 5,
      },
      data: {},
      answer: null,
    },
    {
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Was können Deepfakes sein?',
        options: ['Videos', 'Fotos', 'Zeitungsartikel', 'Leckere Nachtische'],
      },
      answer: [1, 2],
    },
    {
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
        text: 'Deepfakes kann man immer anhand der Videoqualität erkennen!',
        options: ['Richtig', 'Falsch'],
      },
      answer: [2],
    },
    {
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
      type: NodeType.DefaultQuiz,
      settings: {
        secondsUntilAnswer: 20,
        secondsAutoNext: 0,
      },
      data: {
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
    {
      type: NodeType.Scoreboard,
      settings: {
        secondsUntilAnswer: 0,
        secondsAutoNext: 0,
      },
      data: {},
      answer: null,
    },
  ]);

  const [imgData] = useState<Object>({
    real: [
      '25486',
      '27307',
      '29568',
      '30371',
      '31270',
      '32759',
      '33704',
      '16663',
      '19792',
      '20829',
    ],
    fake: [
      '05719',
      '10629',
      '12056',
      '14215',
      '20149',
      '35255',
      '45952',
      '62128',
      '83250',
      '95034',
    ],
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

  function pushObject(collection: string, key: string, data: any) {
    nakamaRef.current?.writeDataToStorage(collection, key, data);
  }

  return (
    <div className="flex flex-col justify-center max-w-screen-md m-auto text-center">
      <Button
        onClick={() =>
          pushObject('defaultQuiz', 'deepfake_detective', quizData)
        }
        size="lg"
        variant="primary"
        className="m-auto my-5"
        asChild
      >
        <Link href="">Push Deepfake_Detective</Link>
      </Button>
      <Button
        onClick={() => pushObject('guessTheFake', 'guess_the_fake', imgData)}
        size="lg"
        variant="primary"
        className="m-auto my-5"
        asChild
      >
        <Link href="">Push Guess The Fake</Link>
      </Button>
      <Button
        onClick={() =>
          pushObject(
            'workshop',
            'deepfake_detective_quiz',
            deepfakeDetectiveQuizData
          )
        }
        size="lg"
        variant="primary"
        className="m-auto my-5"
        asChild
      >
        <Link href="">Push Deepfake Detective Quiz</Link>
      </Button>
      <Button
        onClick={() =>
          pushObject(
            'workshop',
            'deepfake_detective_guessTheFake',
            deepfakeDetectiveImgQuizData
          )
        }
        size="lg"
        variant="primary"
        className="m-auto my-5"
        asChild
      >
        <Link href="">Push Deepfake Detective Guess The Fake</Link>
      </Button>
    </div>
  );
}
