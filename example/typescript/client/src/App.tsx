import { SocketIOClientTransport } from '@hyperschema/client';
import { useEffect, useState } from 'react';

import './App.css';
import reactLogo from './assets/react.svg';
import { MainService } from './hs-client';
import viteLogo from '/vite.svg';

const mainService = new MainService(
  new SocketIOClientTransport({
    url: 'http://localhost:3100',
    authToken: 'testlolololol',
  }),
);
(globalThis as any).client = mainService;

// mainService.child.onTick((x) => {
//   console.log(`ticking ${x}`);
// });

function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    mainService.onConnect(() => {
      setLoaded(true);
    });
  });

  if (!loaded) return <div>loading...</div>;

  return (
    <>
      <div className="card">
        <button
          onClick={async () => {
            console.log('click');
            const res = await mainService.add({ x: 1, y: 2 });
            console.log(res);
          }}
        >
          test things
        </button>
      </div>
    </>
  );
}

export default App;
