'use client';
import Player from '@/models/player';

interface PageProps {
  players: Player[];
}

export default function GameLobby({ players }: PageProps) {
  return (
    <>
      <div>
        <div>
          <h3>Spieler*innen</h3>
        </div>
        <div>
          <h3>Punkte letztes Game</h3>
        </div>
        {players && (
          <>
            {players.map((player) => (
              <div key={player.id}>
                <div>{player.name}</div>
                <div>{player.scoreLastGame}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="relative flex flex-col text-gray-700 bg-white shadow-md w-96 rounded-xl bg-clip-border">
        <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
          <div
            role="button"
            className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
          >
            <div className="grid mr-4 place-items-center">
              <img
                alt="candice"
                src="https://docs.material-tailwind.com/img/face-1.jpg"
                className="relative inline-block h-12 w-12 !rounded-full  object-cover object-center"
              />
            </div>
            <div>
              <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                Tania Andrew
              </h6>
              <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
                Software Engineer @ Material Tailwind
              </p>
            </div>
          </div>
          <div
            role="button"
            className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
          >
            <div className="grid mr-4 place-items-center">
              <img
                alt="alexander"
                src="https://docs.material-tailwind.com/img/face-2.jpg"
                className="relative inline-block h-12 w-12 !rounded-full  object-cover object-center"
              />
            </div>
            <div>
              <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                Alexander
              </h6>
              <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
                Backend Developer @ Material Tailwind
              </p>
            </div>
          </div>
          <div
            role="button"
            className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
          >
            <div className="grid mr-4 place-items-center">
              <img
                alt="emma"
                src="https://docs.material-tailwind.com/img/face-3.jpg"
                className="relative inline-block h-12 w-12 !rounded-full  object-cover object-center"
              />
            </div>
            <div>
              <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                Emma Willever
              </h6>
              <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
                UI/UX Designer @ Material Tailwind
              </p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
