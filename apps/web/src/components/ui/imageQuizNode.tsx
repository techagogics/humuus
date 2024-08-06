import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

function ImageQuizNode(props: any) {
  const [correctAnswer, setCorrectAnswer] = useState(-1);

  const [myAnswer, setMyAnswer] = useState(-1);

  const [currentAnswer, setCurrentAnswer] = useState(-1);

  const [done, setDone] = useState(false);

  function handleOnChange(num: number) {
    if (!props.onlyShow) {
      setCurrentAnswer(num);

      if (!done) {
        props.sendDone();
        setDone(true);
      }

      props.setAnswer([num + 1]);
    }
  }

  useEffect(() => {
    if (props.answer) {
      if (!isNaN(props.answer[0])) setCorrectAnswer(props.answer[0] - 1);

      setMyAnswer(currentAnswer);

      if (props.answer < 0) {
        setMyAnswer(-1);
        setCurrentAnswer(-1);
        props.sendAnswer(-1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.answer]);

  return (
    <>
      <p className="text-center">
        {correctAnswer < 0 ? (
          props.timeLeft != null ? (
            <b>Zeit zum Antworten: {props.timeLeft}</b>
          ) : (
            <b>Warte auf Antworten!</b>
          )
        ) : (
          <b>Auflösung!</b>
        )}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div
          className={
            (currentAnswer == 0 && correctAnswer < 0
              ? 'outline outline-8 outline-yellow-300'
              : ' ') +
            (myAnswer == 0 && myAnswer != correctAnswer
              ? 'outline outline-8 outline-red-600'
              : ' ') +
            ' ' +
            (correctAnswer == 0 ? 'outline outline-8 outline-green-400' : ' ')
          }
          onClick={() => handleOnChange(0)}
        >
          <Image
            width={200}
            height={200}
            style={{ width: '100%', height: 'auto' }}
            src={'/guessTheFake_Data/' + props.images[0] + '.jpeg'}
            alt="Option 1"
          />
        </div>
        <div
          className={
            (currentAnswer == 1 && correctAnswer < 0
              ? 'outline outline-8 outline-yellow-300'
              : ' ') +
            (myAnswer == 1 && myAnswer != correctAnswer
              ? 'outline outline-8 outline-red-600'
              : ' ') +
            ' ' +
            (correctAnswer == 1 ? 'outline outline-8 outline-green-400' : ' ')
          }
          onClick={() => handleOnChange(1)}
        >
          <Image
            width={200}
            height={200}
            style={{ width: '100%', height: 'auto' }}
            src={'/guessTheFake_Data/' + props.images[1] + '.jpeg'}
            alt="Option 2"
          />
        </div>
      </div>
    </>
  );
}

export default ImageQuizNode;
