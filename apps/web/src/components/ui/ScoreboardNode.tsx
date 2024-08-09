import { useEffect, useState } from 'react';

function Scoreboard(props: any) {
  const renderScoreboard = (scoreboard: {
    [key: string]: { username: string; score: number };
  }) => {
    let content = [];
    for (let key in scoreboard) {
      content.push(
        <p key={key}>
          <b>{scoreboard[key].username}:</b> {scoreboard[key].score}
        </p>
      );
    }
    return content;
  };
  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex flex-col justify-center items-center text-center">
        {renderScoreboard(props.scoreboard)}
      </div>
    </div>
  );
}

export default Scoreboard;
