"use client";

import { useLocalStorage } from "./useLocalStorage";
import Board from "./board";

export default function Home() {
  const [room, setRoom] = useLocalStorage("room", "");
  const [name, setName] = useLocalStorage("name", "");
  const joined = room && name;

  const submitHandler = (data: FormData) => {
    const username = data.get(`username`);
    const room = data.get(`room`);
    setRoom(room);
    setName(username);
  };

  if (!joined) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          action={submitHandler}
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="username"
              type="text"
              placeholder="Username"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="room"
            >
              Room
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="room"
              type="text"
              placeholder="Room"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Join Room
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <Board name={name} room={room} logout={() => (setRoom(``), setName(``))} />
  );
}
