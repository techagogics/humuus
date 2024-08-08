import { useEffect, useState } from 'react';

function PlayerList(props: any) {
  return (
    <div className="h-full w-full">
      {props.isHost ? (
        <div
          className={
            'grid gap-3 w-full grid-cols-5 h-min-min text-black ' +
            (props.users.length > 10 && 'h-full')
          }
        >
          {props.users.map((value: string, num: number) => (
            <div
              className={
                'flex items-center justify-center bg-white rounded-2xl text-xl font-bold text-center p-4 ' +
                (props.users.length <= 10 && 'h-36')
              }
              key={num}
            >
              {value}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex justify-center items-center text-center">
          <p className="font-bold text-2xl">Warte darauf, dass es los geht!</p>
        </div>
      )}
    </div>
  );
}

export default PlayerList;
