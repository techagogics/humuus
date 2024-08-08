import { useEffect, useState } from 'react';
import { Button } from './button';

function Header(props: any) {
  return (
    <nav className="grid grid-flow-col items-center p-10 text-white text-base max-md:p-5 max-md:pb-0">
      <div>
        <span
          onClick={() => {
            if (props.leaveMatch != undefined) {
              props.leaveMatch();
            }
          }}
          className="font-bold text-2xl cursor-pointer"
        >
          humuus
        </span>
      </div>
      {props.isHost && (
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground h-10 px-4 py-2">
            Join at humuus.com
            {props.joinCode != undefined && ' | '}
            {props.joinCode != undefined && <b>&nbsp;{props.joinCode}</b>}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-4">
        {props.isHost ? (
          <>
            <Button>
              <b>?</b>
            </Button>
            <Button>
              <b>?</b>
            </Button>
          </>
        ) : (
          <>
            <Button>
              <b>?</b>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header;
