import { useEffect, useState } from 'react';

function PlayerList(props: any) {
  return (
    <div className="w-screen h-screen p-3 bg-black">
      <div
        className={
          'grid gap-3 w-full grid-cols-5 h-min-min ' +
          (props.users.length > 10 && 'h-full')
        }
      >
        {props.users.map((value: string, num: number) => (
          <div
            className={
              'flex items-center justify-center bg-white rounded-2xl text-xl font-bold ' +
              (props.users.length <= 10 && 'h-36')
            }
            key={num}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerList;
