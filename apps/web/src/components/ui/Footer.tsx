import { useEffect, useState } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Footer(props: any) {
  return (
    <nav className="flex p-10 gap-4 text-white text-base max-md:hidden">
      {props.forwardButtonText != undefined && props.isHost ? (
        <>
          <Button onClick={() => props.backButton()} size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={() => props.nextButton()}>
            <ChevronRight className="h-4 w-4 mr-1" />
            {props.forwardButtonText}
          </Button>
        </>
      ) : (
        <div className="bg-transparent text-transparent">-</div>
      )}
    </nav>
  );
}

export default Footer;
