import { useEffect, useState } from 'react';

function DefaultQuiz(props: any) {
  const [correctAnswer, setCorrectAnswer] = useState([-1]);

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
      if (!isNaN(props.answer[0])) setCorrectAnswer(props.answer);

      setMyAnswer(currentAnswer);

      if (props.answer < 0) {
        setMyAnswer(-1);
        setCurrentAnswer(-1);
        props.setAnswer(-1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.answer]);

  return (
    <>
      <p className="text-center max-md:hidden">
        {correctAnswer[0] < 0 ? (
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
      <p className="font-black text-2xl mb-5 max-md:hidden">{props.text}</p>
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 text-black">
        {props.answers.map((value: string, num: number) => (
          <div
            className={
              'bg-white rounded-xl box-border border-8 flex gap-6 p-6 items-center justify-center text-2xl font-bold ' +
              (!props.onlyShow ? 'cursor-pointer' : ' ') +
              ' ' +
              (currentAnswer == num && correctAnswer[0] < 0
                ? 'border-yellow-300'
                : ' ') +
              ' ' +
              (myAnswer == num && !correctAnswer.includes(myAnswer + 1)
                ? 'border-red-600'
                : ' ') +
              ' ' +
              (correctAnswer.includes(num + 1) ? 'border-green-400' : ' ')
            }
            onClick={() => handleOnChange(num)}
            key={num}
          >
            <div className="text-5xl">{num + 1}.</div>
            <div className="max-md:hidden">{value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default DefaultQuiz;
