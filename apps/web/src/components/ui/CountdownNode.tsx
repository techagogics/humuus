import { useEffect, useState } from 'react';

function Countdown(props: any) {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex flex-col justify-center items-center text-center">
        <p className="text-center text-6xl font-bold">{props.time}</p>
      </div>
    </div>
  );
}

export default Countdown;
