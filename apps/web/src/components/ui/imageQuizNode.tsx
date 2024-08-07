import { useEffect, useState } from 'react';
import Image from 'next/image';

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
        ) : props.timeLeft != null ? (
          <b>Nächstes Node in {props.timeLeft}</b>
        ) : (
          <b>Auflösung!</b>
        )}
      </p>
      <p className="font-black text-2xl mb-5">{props.text}</p>
      <div className="w-full overflow-hidden">
        <div className="relativ m-auto aspect-[2/1] max-md:aspect-[1/2] max-h-full grid grid-cols-2 max-md:grid-cols-1 max-md:grid-rows-2 gap-4">
          <div
            className={
              'relative w-full overflow-hidden rounded-xl box-border border-8 ' +
              (currentAnswer == 0 && correctAnswer < 0
                ? 'border-yellow-300'
                : ' ') +
              (myAnswer == 0 && myAnswer != correctAnswer
                ? 'border-red-600'
                : ' ') +
              ' ' +
              (correctAnswer == 0 ? 'border-green-400' : ' ')
            }
            onClick={() => handleOnChange(0)}
          >
            <Image
              fill={true}
              style={{ objectFit: 'cover' }}
              sizes="100%"
              src={'/guessTheFake_Data/' + props.images[0] + '.jpeg'}
              alt="Option 1"
            />
          </div>
          <div
            className={
              'relative w-full overflow-hidden rounded-xl box-border border-8 ' +
              (currentAnswer == 1 && correctAnswer < 0
                ? 'border-yellow-300'
                : ' ') +
              (myAnswer == 1 && myAnswer != correctAnswer
                ? 'border-red-600'
                : ' ') +
              ' ' +
              (correctAnswer == 1 ? 'border-green-400' : ' ')
            }
            onClick={() => handleOnChange(1)}
          >
            <Image
              fill={true}
              style={{ objectFit: 'cover' }}
              sizes="100%"
              src={'/guessTheFake_Data/' + props.images[1] + '.jpeg'}
              alt="Option 2"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageQuizNode;
