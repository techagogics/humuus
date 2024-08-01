import { useEffect, useState } from 'react';

function Question(props: any) {
  const [correctAnswer, setCorrectAnswer] = useState([-1]);

  const [myAnswer, setMyAnswer] = useState(-1);

  const [currentAnswer, setCurrentAnswer] = useState(-1);

  function handleOnChange(num: number) {
    if (props.onlyShow && !props.answered) {
      setCurrentAnswer(num);

      props.sendAnswer([num]);
    }
  }

  useEffect(() => {
    if (props.answer) {
      setCorrectAnswer(props.answer);

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
      <p className="font-black text-2xl mb-5">{props.question}</p>
      {props.answers.map((value: string, num: number) => (
        <p
          className={
            (currentAnswer == num ? 'font-bold' : ' ') +
            ' ' +
            (myAnswer == num && !correctAnswer.includes(myAnswer + 1)
              ? 'font-bold text-red-600'
              : ' ') +
            ' ' +
            (correctAnswer.includes(num + 1) ? 'font-bold text-green-400' : ' ')
          }
          key={num}
        >
          <span
            className={props.onlyShow ? 'cursor-pointer' : ' '}
            onClick={() => handleOnChange(num)}
          >
            {' ' + (num + 1)}. {value}
          </span>
        </p>
      ))}
    </>
  );
}

export default Question;
