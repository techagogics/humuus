import { useEffect, useState } from 'react';
import Image from 'next/image';

function ImageQuiz(props: any) {
  const [correctAnswer, setCorrectAnswer] = useState(-1);

  const [myAnswer, setMyAnswer] = useState(-1);

  const [currentAnswer, setCurrentAnswer] = useState(-1);

  function handleOnChange(num: number) {
    if (props.onlyShow && !props.answered) {
      setCurrentAnswer(num);

      props.sendAnswer(num);
    }
  }

  useEffect(() => {
    if (props.answer) {
      setCorrectAnswer(props.answer - 1);

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

export default ImageQuiz;
