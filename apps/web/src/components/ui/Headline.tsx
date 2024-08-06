import { useEffect, useState } from 'react';

function Headline(props: any) {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex justify-center items-center text-center">
        <p className="font-bold text-4xl">{props.text}</p>
      </div>
    </div>
  );
}

export default Headline;
