import { useEffect, useState } from 'react';

function Header(props: any) {
  return (
    <nav className="w-screen grid grid-cols-3 items-center px-6 py-8 text-white">
      <div className="font-bold text-lg">humuus</div>
      <div className="flex justify-center text-sm">
        <div className="bg-white text-black px-3 py-1 rounded-sm">
          Join at humuus.com | <b>3576</b>
        </div>
      </div>
      <div className="flex justify-end gap-4 text-sm">
        <div className="bg-white text-black px-3 py-1 rounded-sm">Buttons</div>
        <div className="bg-white text-black px-3 py-1 rounded-sm">Buttons</div>
      </div>
    </nav>
  );
}

export default Header;
