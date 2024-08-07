import { useEffect, useState } from 'react';

function Headline(props: any) {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex flex-col justify-center items-center text-center">
        <p className="font-bold text-4xl">{props.text}</p>
        <p className="text-center font-extralight">
          {props.timeLeft != null && <b>Nächstes Node in {props.timeLeft}</b>}
        </p>
      </div>
    </div>
  );
}

export default Headline;
